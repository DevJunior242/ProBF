<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Enums\StatutDemande;
use App\Http\Controllers\Controller;
use App\Models\Demande;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    const COMMISSION_CLIENT_FCFA = 25;

    public function index(Request $request)
    {
        return Demande::with(['client', 'metier', 'quartier'])
            ->when(
                $request->boolean('mine'),
                fn ($q) => $q->where('client_id', $request->user()->id),
                fn ($q) => $q->where('statut', StatutDemande::Ouverte)
            )
            ->when($request->query('metier_id'), fn ($q, $id) => $q->where('metier_id', $id))
            ->when($request->query('quartier_id'), fn ($q, $id) => $q->where('quartier_id', $id))
            ->when($request->boolean('urgence'), fn ($q) => $q->where('urgence', true))
            ->latest()
            ->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'metier_id' => ['required', 'exists:metiers,id'],
            'quartier_id' => ['required', 'exists:quartiers,id'],
            'description' => ['required', 'string', 'max:1000'],
            'urgence' => ['nullable', 'boolean'],
        ]);

        $demande = $request->user()->demandes()->create($data);

        $this->crediterCommissionAmbassadeurSiEligible($request->user());

        return response()->json($demande->load(['metier', 'quartier']), 201);
    }

    public function update(Request $request, Demande $demande)
    {
        abort_if($demande->client_id !== $request->user()->id, 403);

        $data = $request->validate([
            'metier_id' => ['sometimes', 'exists:metiers,id'],
            'quartier_id' => ['sometimes', 'exists:quartiers,id'],
            'description' => ['sometimes', 'string', 'max:1000'],
            'urgence' => ['nullable', 'boolean'],
        ]);

        $demande->update($data);

        return $demande->load(['metier', 'quartier']);
    }

    public function destroy(Request $request, Demande $demande)
    {
        abort_if($demande->client_id !== $request->user()->id, 403);

        $demande->delete();

        return response()->json(status: 204);
    }

    public function toggleStatut(Request $request, Demande $demande)
    {
        abort_if($demande->client_id !== $request->user()->id, 403);

        $demande->update([
            'statut' => $demande->statut === StatutDemande::Ouverte ? StatutDemande::Traitee : StatutDemande::Ouverte,
        ]);

        return $demande->load(['metier', 'quartier']);
    }

    /**
     * Bonus ambassadeur pour un filleul client "pur" (ni pro ni fournisseur,
     * qui ne paiera donc jamais d'abonnement) : crédité une seule fois, à sa
     * toute première demande postée — le moment où il devient un vrai lead.
     */
    private function crediterCommissionAmbassadeurSiEligible(User $client): void
    {
        if ($client->hasRole(RoleNom::Pro) || $client->hasRole(RoleNom::Fournisseur)) {
            return;
        }

        $estPremiereDemande = Demande::where('client_id', $client->id)->count() === 1;

        if (! $estPremiereDemande) {
            return;
        }

        Invitation::crediterCommissionPour($client, self::COMMISSION_CLIENT_FCFA);
    }
}
