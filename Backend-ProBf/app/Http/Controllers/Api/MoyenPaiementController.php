<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Http\Controllers\Controller;
use App\Models\MoyenPaiement;
use Illuminate\Http\Request;

class MoyenPaiementController extends Controller
{
    public function index(Request $request)
    {
        $query = MoyenPaiement::orderBy('ordre')->orderBy('nom');

        if (! $request->user()->hasRole(RoleNom::Admin)) {
            $query->where('actif', true);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'string', 'max:255'],
            'nom_compte' => ['nullable', 'string', 'max:255'],
            'instructions' => ['nullable', 'string', 'max:1000'],
            'logo' => ['nullable', 'string'],
            'actif' => ['nullable', 'boolean'],
            'ordre' => ['nullable', 'integer', 'min:0'],
        ]);

        return response()->json(MoyenPaiement::create($data), 201);
    }

    public function update(Request $request, MoyenPaiement $moyenPaiement)
    {
        $data = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'numero' => ['sometimes', 'string', 'max:255'],
            'nom_compte' => ['nullable', 'string', 'max:255'],
            'instructions' => ['nullable', 'string', 'max:1000'],
            'logo' => ['nullable', 'string'],
            'actif' => ['nullable', 'boolean'],
            'ordre' => ['nullable', 'integer', 'min:0'],
        ]);

        $moyenPaiement->update($data);

        return $moyenPaiement;
    }

    public function destroy(MoyenPaiement $moyenPaiement)
    {
        $moyenPaiement->delete();

        return response()->json(status: 204);
    }
}
