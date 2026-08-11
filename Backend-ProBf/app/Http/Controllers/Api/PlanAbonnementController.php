<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Enums\TypeAbonnement;
use App\Http\Controllers\Controller;
use App\Models\PlanAbonnement;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlanAbonnementController extends Controller
{
    public function index(Request $request)
    {
        $query = PlanAbonnement::orderBy('type')->orderBy('ordre')->orderBy('montant');

        if (! $request->user()->hasRole(RoleNom::Admin)) {
            $query->where('actif', true);
        }

        $query->when($request->query('type'), fn ($q, $type) => $q->where('type', $type));

        return $query->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', Rule::in([TypeAbonnement::Pro->value, TypeAbonnement::Fournisseur->value])],
            'nom' => ['required', 'string', 'max:255'],
            'duree_jours' => ['required', 'integer', 'min:1'],
            'montant' => ['required', 'numeric', 'min:0'],
            'actif' => ['nullable', 'boolean'],
            'ordre' => ['nullable', 'integer', 'min:0'],
        ]);

        return response()->json(PlanAbonnement::create($data), 201);
    }

    public function update(Request $request, PlanAbonnement $planAbonnement)
    {
        $data = $request->validate([
            'type' => ['sometimes', Rule::in([TypeAbonnement::Pro->value, TypeAbonnement::Fournisseur->value])],
            'nom' => ['sometimes', 'string', 'max:255'],
            'duree_jours' => ['sometimes', 'integer', 'min:1'],
            'montant' => ['sometimes', 'numeric', 'min:0'],
            'actif' => ['nullable', 'boolean'],
            'ordre' => ['nullable', 'integer', 'min:0'],
        ]);

        $planAbonnement->update($data);

        return $planAbonnement;
    }

    public function destroy(PlanAbonnement $planAbonnement)
    {
        $planAbonnement->delete();

        return response()->json(status: 204);
    }
}
