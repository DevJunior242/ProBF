<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Enums\StatutPaiement;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaiementRequest;
use App\Models\Abonnement;
use App\Models\Boost;
use App\Models\Invitation;
use App\Models\Paiement;
use App\Models\PlanAbonnement;
use App\Models\User;
use App\Notifications\NouvelleDemandeExpressNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaiementController extends Controller
{
    public function store(StorePaiementRequest $request)
    {
        $data = $request->validated();

        $plan = PlanAbonnement::findOrFail($data['plan_abonnement_id']);

        $paiement = $request->user()->paiements()->create([
            ...$data,
            'type' => $plan->type,
            'contexte' => 'abonnement',
            'statut' => StatutPaiement::EnAttente,
        ]);

        return response()->json($paiement->load('planAbonnement'), 201);
    }

    public function index(Request $request)
    {
        return Paiement::with(['user', 'moyenPaiement', 'planAbonnement', 'demande.metier', 'demande.quartier', 'promo.produit'])
            ->where('statut', StatutPaiement::EnAttente)
            ->latest()
            ->paginate(20);
    }

    public function mesPaiements(Request $request)
    {
        return $request->user()->paiements()
            ->with(['moyenPaiement', 'planAbonnement', 'demande.metier', 'demande.quartier', 'promo.produit'])
            ->latest()
            ->get();
    }

    public function valider(Request $request, Paiement $paiement)
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['valider', 'rejeter'])],
        ], [
            'action.required' => 'Précise si tu valides ou rejettes ce paiement.',
            'action.in' => 'Action invalide.',
        ]);

        abort_if($paiement->statut !== StatutPaiement::EnAttente, 422, 'Ce paiement a déjà été traité.');

        if ($data['action'] === 'rejeter') {
            $paiement->update([
                'statut' => StatutPaiement::Rejete,
                'valide_par_admin_id' => $request->user()->id,
            ]);

            return $paiement;
        }

        $this->crediterCommissionAmbassadeurSiEligible($paiement);

        if ($paiement->contexte === 'boost') {
            $boost = Boost::activerPour($paiement->user, 24);

            $paiement->update([
                'statut' => StatutPaiement::Valide,
                'valide_par_admin_id' => $request->user()->id,
                'boost_id' => $boost->id,
            ]);

            return $paiement->load('boost');
        }

        if ($paiement->contexte === 'devis_express') {
            $demande = $paiement->demande;

            $prosExpress = User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Pro))
                ->whereHas('metiers', fn ($q) => $q->where('metiers.id', $demande->metier_id))
                ->whereHas('boosts', fn ($q) => $q->where('expires_at', '>=', now()))
                ->limit(3)
                ->get();

            foreach ($prosExpress as $pro) {
                $pro->notify(new NouvelleDemandeExpressNotification($demande));
            }

            $paiement->update([
                'statut' => StatutPaiement::Valide,
                'valide_par_admin_id' => $request->user()->id,
            ]);

            return $paiement;
        }

        if ($paiement->contexte === 'promo') {
            $paiement->promo->update(['expires_at' => now()->addDays(7)]);

            $paiement->update([
                'statut' => StatutPaiement::Valide,
                'valide_par_admin_id' => $request->user()->id,
            ]);

            return $paiement->load('promo.produit');
        }

        $dureeJours = $paiement->planAbonnement?->duree_jours ?? 30;
        $abonnement = Abonnement::extendFor($paiement->user, $paiement->type, $dureeJours, (float) $paiement->montant);

        $paiement->update([
            'statut' => StatutPaiement::Valide,
            'valide_par_admin_id' => $request->user()->id,
            'abonnement_id' => $abonnement->id,
        ]);

        return $paiement->load('abonnement');
    }

    /**
     * Si $paiement est le tout premier paiement validé de son auteur, et que
     * cet auteur a été parrainé, crédite une commission unique de 10% à son
     * ambassadeur (parrain).
     */
    private function crediterCommissionAmbassadeurSiEligible(Paiement $paiement): void
    {
        $filleul = $paiement->user;

        $dejaPaye = Paiement::where('user_id', $filleul->id)
            ->where('statut', StatutPaiement::Valide)
            ->exists();

        if ($dejaPaye) {
            return;
        }

        Invitation::crediterCommissionPour($filleul, (float) $paiement->montant * 0.10);
    }
}
