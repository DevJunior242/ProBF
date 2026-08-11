<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatutPaiement;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBoostRequest;

class BoostController extends Controller
{
    const PRIX_FCFA = 50;

    public function store(StoreBoostRequest $request)
    {
        $data = $request->validated();

        $paiement = $request->user()->paiements()->create([
            ...$data,
            'montant' => self::PRIX_FCFA,
            'contexte' => 'boost',
            'statut' => StatutPaiement::EnAttente,
        ]);

        return response()->json($paiement, 201);
    }
}
