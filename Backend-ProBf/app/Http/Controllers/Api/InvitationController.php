<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Enums\StatutInvitation;
use App\Enums\StatutRetrait;
use App\Enums\TypeAbonnement;
use App\Http\Controllers\Api\Concerns\GenereSeriePeriodique;
use App\Http\Controllers\Controller;
use App\Models\Abonnement;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    use GenereSeriePeriodique;

    public function index(Request $request)
    {
        return $request->user()->invitationsEnvoyees()
            ->with('filleul')
            ->latest()
            ->get();
    }

    public function generate(Request $request)
    {
        $invitation = $request->user()->invitationsEnvoyees()
            ->where('statut', StatutInvitation::EnAttente)
            ->first();

        if (! $invitation) {
            $invitation = $request->user()->invitationsEnvoyees()->create([
                'code' => Str::upper(Str::random(6)),
                'statut' => StatutInvitation::EnAttente,
            ]);
        }

        return $invitation;
    }

    public function redeem(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'exists:invitations,code'],
        ]);

        $invitation = Invitation::where('code', $data['code'])
            ->where('statut', StatutInvitation::EnAttente)
            ->firstOrFail();

        abort_if($invitation->parrain_id === $request->user()->id, 422, "Tu ne peux pas utiliser ton propre code.");

        $invitation->update([
            'filleul_id' => $request->user()->id,
            'statut' => StatutInvitation::Validee,
            'recompense_appliquee' => true,
        ]);

        $this->etendreAbonnementSelonRole($request->user(), 14);
        $this->etendreAbonnementSelonRole($invitation->parrain, 30);

        return $invitation->load(['parrain', 'filleul']);
    }

    /**
     * Prolonge l'abonnement de $user pour chaque rôle payant qu'il a
     * réellement (pro et/ou fournisseur). Ne fait rien pour un client pur,
     * qui n'a pas d'abonnement à prolonger.
     */
    private function etendreAbonnementSelonRole(User $user, int $jours): void
    {
        if ($user->hasRole(RoleNom::Pro)) {
            Abonnement::extendFor($user, TypeAbonnement::Pro, $jours);
        }

        if ($user->hasRole(RoleNom::Fournisseur)) {
            Abonnement::extendFor($user, TypeAbonnement::Fournisseur, $jours);
        }
    }

    public function solde(Request $request)
    {
        $user = $request->user();

        return [
            'solde' => $user->soldeAmbassadeur(),
            'total_gagne' => (float) $user->invitationsEnvoyees()->whereNotNull('commission_montant')->sum('commission_montant'),
            'total_retire' => (float) $user->retraits()->where('statut', StatutRetrait::Valide)->sum('montant'),
            'filleuls_total' => $user->invitationsEnvoyees()->whereNotNull('filleul_id')->count(),
        ];
    }

    public function graphiques(Request $request)
    {
        $periode = $request->query('periode', 'jour');

        [$format, $depuis, $pas] = match ($periode) {
            'mois' => ['%Y-%m', now()->subMonths(5)->startOfMonth(), 'addMonth'],
            default => ['%Y-%m-%d', now()->subDays(13)->startOfDay(), 'addDay'],
        };

        $serie = $request->user()->invitationsEnvoyees()
            ->whereNotNull('commission_montant')
            ->selectRaw("DATE_FORMAT(updated_at, '{$format}') as periode, sum(commission_montant) as total")
            ->where('updated_at', '>=', $depuis)
            ->groupBy('periode')->orderBy('periode')->get();

        return [
            'periode' => $periode,
            'label' => 'Mes gains (F CFA)',
            'donnees' => $this->remplirPeriodes($serie, $format, $depuis, $pas),
        ];
    }
}
