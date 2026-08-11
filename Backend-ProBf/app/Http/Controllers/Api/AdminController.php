<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Enums\StatutAbonnement;
use App\Enums\StatutDemande;
use App\Enums\StatutPaiement;
use App\Http\Controllers\Api\Concerns\GenereSeriePeriodique;
use App\Http\Controllers\Controller;
use App\Models\Abonnement;
use App\Models\Avis;
use App\Models\Demande;
use App\Models\Invitation;
use App\Models\Paiement;
use App\Models\Profile;
use App\Models\User;
use App\Models\WhatsappClick;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use GenereSeriePeriodique;

    public function dashboard(Request $request)
    {
        return [
            'utilisateurs' => [
                'total' => User::count(),
                'clients' => User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Client))->count(),
                'pros' => User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Pro))->count(),
                'fournisseurs' => User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Fournisseur))->count(),
            ],
            'paiements_en_attente' => Paiement::where('statut', StatutPaiement::EnAttente)->count(),
            'abonnements_actifs' => Abonnement::where('statut', StatutAbonnement::Actif)->where('date_fin', '>=', now())->count(),
            'revenu_ce_mois' => (float) Paiement::where('statut', StatutPaiement::Valide)
                ->whereMonth('updated_at', now()->month)
                ->whereYear('updated_at', now()->year)
                ->sum('montant'),
            'demandes_ouvertes' => Demande::where('statut', StatutDemande::Ouverte)->count(),
            'avis_total' => Avis::count(),
            'whatsapp_clicks_ce_mois' => WhatsappClick::whereMonth('created_at', now()->month)->count(),
            'profils_masques' => Profile::where('masque', true)->count(),
        ];
    }

    public function graphiques(Request $request)
    {
        $periode = $request->query('periode', 'mois');

        [$format, $depuis, $pas] = match ($periode) {
            'jour' => ['%Y-%m-%d', now()->subDays(29)->startOfDay(), 'addDay'],
            'annee' => ['%Y', now()->subYears(4)->startOfYear(), 'addYear'],
            default => ['%Y-%m', now()->subMonths(11)->startOfMonth(), 'addMonth'],
        };

        $inscriptions = User::selectRaw("DATE_FORMAT(created_at, '{$format}') as periode, count(*) as total")
            ->where('created_at', '>=', $depuis)
            ->groupBy('periode')
            ->orderBy('periode')
            ->get();

        $revenu = Paiement::selectRaw("DATE_FORMAT(updated_at, '{$format}') as periode, sum(montant) as total")
            ->where('statut', StatutPaiement::Valide)
            ->where('updated_at', '>=', $depuis)
            ->groupBy('periode')
            ->orderBy('periode')
            ->get();

        return [
            'periode' => $periode,
            'inscriptions' => $this->remplirPeriodes($inscriptions, $format, $depuis, $pas),
            'revenu' => $this->remplirPeriodes($revenu, $format, $depuis, $pas),
        ];
    }

    public function activite(Request $request)
    {
        $jours = (int) $request->query('jours', 1);
        $depuis = now()->subDays($jours - 1)->startOfDay();

        $nouveauxUsers = User::with('roles')->where('created_at', '>=', $depuis)->get()
            ->map(fn (User $u) => [
                'type' => 'inscription',
                'texte' => "{$u->nom} s'est inscrit ({$u->roles->pluck('nom')->map(fn ($r) => $r->value)->implode(', ')})",
                'date' => $u->created_at,
            ]);

        $parrainages = Invitation::with(['parrain', 'filleul'])
            ->whereNotNull('filleul_id')
            ->where('updated_at', '>=', $depuis)
            ->get()
            ->map(fn (Invitation $i) => [
                'type' => 'parrainage',
                'texte' => "{$i->filleul->nom} a rejoint via le code de {$i->parrain->nom}",
                'date' => $i->updated_at,
            ]);

        $contacts = WhatsappClick::with(['client', 'pro'])->where('created_at', '>=', $depuis)->get()
            ->map(fn (WhatsappClick $c) => [
                'type' => 'contact',
                'texte' => ($c->client->nom ?? 'Un visiteur')." a contacté {$c->pro->nom} via WhatsApp",
                'date' => $c->created_at,
            ]);

        $demandes = Demande::with(['client', 'metier'])->where('created_at', '>=', $depuis)->get()
            ->map(fn (Demande $d) => [
                'type' => 'demande',
                'texte' => "{$d->client->nom} cherche un {$d->metier->nom}",
                'date' => $d->created_at,
            ]);

        $avis = Avis::with(['client', 'pro'])->where('created_at', '>=', $depuis)->get()
            ->map(fn (Avis $a) => [
                'type' => 'avis',
                'texte' => "{$a->client->nom} a laissé un avis à {$a->pro->nom} ({$a->note}★)",
                'date' => $a->created_at,
            ]);

        $evenements = collect()
            ->merge($nouveauxUsers)
            ->merge($parrainages)
            ->merge($contacts)
            ->merge($demandes)
            ->merge($avis)
            ->sortByDesc('date')
            ->values();

        return [
            'nouveaux_users' => $nouveauxUsers->count(),
            'parrainages' => $parrainages->count(),
            'evenements' => $evenements,
        ];
    }

    public function utilisateurs(Request $request)
    {
        return User::with('roles')
            ->when($request->query('recherche'), fn ($q, $recherche) => $q->where(fn ($w) => $w
                ->where('nom', 'like', "%{$recherche}%")
                ->orWhere('telephone', 'like', "%{$recherche}%")
                ->orWhere('email', 'like', "%{$recherche}%")
            ))
            ->latest()
            ->paginate(20);
    }

    public function supprimerUtilisateur(Request $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 422, 'Tu ne peux pas supprimer ton propre compte admin.');

        $user->delete();

        return response()->json(status: 204);
    }

    public function abonnements(Request $request)
    {
        $abonneActif = fn ($a) => $a->where('statut', StatutAbonnement::Actif)->where('date_fin', '>=', now());
        $statut = $request->query('statut', $request->boolean('impayes') ? 'impaye' : null);

        $users = User::whereHas('roles', fn ($q) => $q->whereIn('nom', [RoleNom::Pro, RoleNom::Fournisseur]))
            ->with(['roles', 'profile', 'dernierAbonnement'])
            ->when(
                $request->query('role'),
                fn ($q, $role) => $q->whereHas('roles', fn ($r) => $r->where('nom', $role))
            )
            ->when($request->query('recherche'), fn ($q, $recherche) => $q->where(fn ($w) => $w
                ->where('nom', 'like', "%{$recherche}%")
                ->orWhere('telephone', 'like', "%{$recherche}%")
                ->orWhere('email', 'like', "%{$recherche}%")
            ))
            ->when($statut === 'actif', fn ($q) => $q->whereHas('abonnements', $abonneActif))
            ->when($statut === 'impaye', fn ($q) => $q->whereDoesntHave('abonnements', $abonneActif))
            ->when($request->query('visibilite') === 'masque', fn ($q) => $q->whereHas('profile', fn ($p) => $p->where('masque', true)))
            ->when($request->query('visibilite') === 'visible', fn ($q) => $q->whereDoesntHave('profile', fn ($p) => $p->where('masque', true)))
            ->get()
            ->map(function (User $user) {
                $abonnement = $user->dernierAbonnement;
                $actif = $abonnement
                    && $abonnement->statut === StatutAbonnement::Actif
                    && $abonnement->date_fin?->isFuture();

                return [
                    'id' => $user->id,
                    'nom' => $user->nom,
                    'telephone' => $user->telephone,
                    'roles' => $user->roles->pluck('nom'),
                    'abonnement' => $abonnement,
                    'abonnement_actif' => (bool) $actif,
                    'masque' => (bool) $user->profile?->masque,
                ];
            });

        return response()->json($users->values());
    }

    public function toggleMasque(Request $request, User $user)
    {
        $profile = $user->profile;

        abort_if(! $profile, 404, "Ce profil n'a pas encore de fiche.");

        $profile->update(['masque' => ! $profile->masque]);

        return $profile;
    }
}
