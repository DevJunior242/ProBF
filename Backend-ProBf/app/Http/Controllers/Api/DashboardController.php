<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Enums\StatutAbonnement;
use App\Enums\StatutDemande;
use App\Enums\TypeAbonnement;
use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Lead;
use App\Models\User;
use App\Models\WhatsappClick;
use App\Http\Controllers\Api\Concerns\GenereSeriePeriodique;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use GenereSeriePeriodique;

    /**
     * Un compte peut cumuler plusieurs rôles (ex: Pro + Fournisseur) ; "espace"
     * précise quel tableau de bord est demandé. Sans "espace" (anciens clients),
     * on garde l'ancienne priorité fournisseur > pro > client.
     */
    private function resoudreEspace(User $user, ?string $espace): string
    {
        if ($espace === 'fournisseur' && $user->hasRole(RoleNom::Fournisseur)) {
            return 'fournisseur';
        }

        if ($espace === 'pro' && $user->hasRole(RoleNom::Pro)) {
            return 'pro';
        }

        if ($user->hasRole(RoleNom::Fournisseur)) {
            return 'fournisseur';
        }

        if ($user->hasRole(RoleNom::Pro)) {
            return 'pro';
        }

        return 'client';
    }

    public function stats(Request $request)
    {
        $user = $request->user();

        return match ($this->resoudreEspace($user, $request->query('espace'))) {
            'fournisseur' => $this->statsFournisseur($user),
            'pro' => $this->statsPro($user),
            default => $this->statsClient($user),
        };
    }

    public function graphiques(Request $request)
    {
        $user = $request->user();
        $periode = $request->query('periode', 'jour');

        [$format, $depuis, $pas] = match ($periode) {
            'mois' => ['%Y-%m', now()->subMonths(5)->startOfMonth(), 'addMonth'],
            default => ['%Y-%m-%d', now()->subDays(13)->startOfDay(), 'addDay'],
        };

        if ($this->resoudreEspace($user, $request->query('espace')) === 'fournisseur') {
            $produitIds = $user->produits()->pluck('id');
            $serie = Lead::whereIn('produit_id', $produitIds)
                ->selectRaw("DATE_FORMAT(created_at, '{$format}') as periode, count(*) as total")
                ->where('created_at', '>=', $depuis)
                ->groupBy('periode')->orderBy('periode')->get();

            return ['periode' => $periode, 'label' => 'Leads', 'donnees' => $this->remplirPeriodes($serie, $format, $depuis, $pas)];
        }

        if ($user->hasRole(RoleNom::Pro)) {
            $serie = WhatsappClick::where('pro_id', $user->id)
                ->selectRaw("DATE_FORMAT(created_at, '{$format}') as periode, count(*) as total")
                ->where('created_at', '>=', $depuis)
                ->groupBy('periode')->orderBy('periode')->get();

            return ['periode' => $periode, 'label' => 'Clics WhatsApp reçus', 'donnees' => $this->remplirPeriodes($serie, $format, $depuis, $pas)];
        }

        $serie = $user->demandes()
            ->selectRaw("DATE_FORMAT(created_at, '{$format}') as periode, count(*) as total")
            ->where('created_at', '>=', $depuis)
            ->groupBy('periode')->orderBy('periode')->get();

        return ['periode' => $periode, 'label' => 'Mes demandes', 'donnees' => $this->remplirPeriodes($serie, $format, $depuis, $pas)];
    }

    private function statsPro(User $user): array
    {
        $metierIds = $user->metiers()->pluck('metiers.id');

        return [
            'statut_dispo' => $user->profile?->statut_dispo?->value,
            'whatsapp_clicks_total' => WhatsappClick::where('pro_id', $user->id)->count(),
            'whatsapp_clicks_ce_mois' => WhatsappClick::where('pro_id', $user->id)->whereMonth('created_at', now()->month)->count(),
            'avis_note_moyenne' => (float) ($user->profile?->note_moyenne ?? 0),
            'avis_total' => $user->profile?->nb_avis ?? 0,
            'demandes_ouvertes_metier' => Demande::whereIn('metier_id', $metierIds)
                ->where('statut', StatutDemande::Ouverte)
                ->count(),
            'abonnement_actif' => $user->abonnements()
                ->where('type', TypeAbonnement::Pro)
                ->where('statut', StatutAbonnement::Actif)
                ->where('date_fin', '>=', now())
                ->latest('date_fin')
                ->first(),
        ];
    }

    private function statsFournisseur(User $user): array
    {
        $produitIds = $user->produits()->pluck('id');

        return [
            'produits_total' => $produitIds->count(),
            'leads_total' => Lead::whereIn('produit_id', $produitIds)->count(),
            'leads_ce_mois' => Lead::whereIn('produit_id', $produitIds)->whereMonth('created_at', now()->month)->count(),
            'abonnement_actif' => $user->abonnements()
                ->where('type', TypeAbonnement::Fournisseur)
                ->where('statut', StatutAbonnement::Actif)
                ->where('date_fin', '>=', now())
                ->latest('date_fin')
                ->first(),
        ];
    }

    private function statsClient(User $user): array
    {
        return [
            'demandes_postees' => $user->demandes()->count(),
            'avis_donnes' => $user->avisDonnes()->count(),
            'pros_contactes' => WhatsappClick::where('client_id', $user->id)->distinct('pro_id')->count('pro_id'),
            'conversations_actives' => $user->conversationsClient()->count(),
        ];
    }
}
