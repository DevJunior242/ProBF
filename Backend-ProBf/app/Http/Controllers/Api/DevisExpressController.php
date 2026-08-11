<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatutPaiement;
use App\Enums\TypeAbonnement;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDevisExpressRequest;

class DevisExpressController extends Controller
{
    const PRIX_FCFA = 25;

    public function store(StoreDevisExpressRequest $request)
    {
        $data = $request->validated();

        $paiement = $request->user()->paiements()->create([
            ...$data,
            'montant' => self::PRIX_FCFA,
            'type' => TypeAbonnement::Pro,
            'contexte' => 'devis_express',
            'statut' => StatutPaiement::EnAttente,
        ]);

        return response()->json($paiement, 201);
    }
}
