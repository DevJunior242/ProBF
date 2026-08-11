<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatutPaiement;
use App\Enums\TypeAbonnement;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePromoRequest;
use App\Models\Promo;

class PromoController extends Controller
{
    const PRIX_FCFA = 1000;

    public function index()
    {
        return Promo::with(['produit', 'fournisseur.fournisseurProfile'])
            ->where('expires_at', '>=', now())
            ->latest('expires_at')
            ->get();
    }

    public function store(StorePromoRequest $request)
    {
        $data = $request->validated();

        $promo = Promo::create([
            'fournisseur_id' => $request->user()->id,
            'produit_id' => $data['produit_id'],
            'prix_promo' => $data['prix_promo'] ?? null,
            'texte' => $data['texte'] ?? null,
        ]);

        $paiement = $request->user()->paiements()->create([
            'moyen_paiement_id' => $data['moyen_paiement_id'] ?? null,
            'reference_transaction' => $data['reference_transaction'] ?? null,
            'preuve' => $data['preuve'] ?? null,
            'montant' => self::PRIX_FCFA,
            'type' => TypeAbonnement::Fournisseur,
            'contexte' => 'promo',
            'promo_id' => $promo->id,
            'statut' => StatutPaiement::EnAttente,
        ]);

        return response()->json($paiement->load('promo.produit'), 201);
    }
}
