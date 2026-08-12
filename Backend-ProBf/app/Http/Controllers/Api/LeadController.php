<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Produit;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function store(Request $request)
    {
        abort_if(! $request->user()->estVerifie(), 403, "Tu dois d'abord vérifier ton identité (CNIB) pour contacter un fournisseur.");

        $data = $request->validate([
            'produit_id' => ['required', 'exists:produits,id'],
        ]);

        $produit = Produit::with('fournisseur')->findOrFail($data['produit_id']);

        // Pas de facturation par clic : la visibilité est déjà couverte par l'abonnement
        // fournisseur. On garde juste le compteur comme indicateur d'intérêt.
        $lead = Lead::create([
            'produit_id' => $produit->id,
            'fournisseur_id' => $produit->fournisseur_id,
            'client_id' => $request->user()->id,
            'cout' => 0,
        ]);

        return response()->json([
            'id' => $lead->id,
            'telephone' => $produit->fournisseur->telephone,
        ], 201);
    }
}
