<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeadController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'produit_id' => ['required', 'exists:produits,id'],
        ]);

        $produit = Produit::findOrFail($data['produit_id']);

        // Pas de facturation par clic : la visibilité est déjà couverte par l'abonnement
        // fournisseur. On garde juste le compteur comme indicateur d'intérêt.
        $lead = Lead::create([
            'produit_id' => $produit->id,
            'fournisseur_id' => $produit->fournisseur_id,
            'client_id' => Auth::guard('sanctum')->user()?->id,
            'cout' => 0,
        ]);

        return response()->json($lead->load('fournisseur'), 201);
    }
}
