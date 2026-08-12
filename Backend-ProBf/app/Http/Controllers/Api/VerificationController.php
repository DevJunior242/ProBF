<?php

namespace App\Http\Controllers\Api;

use App\Enums\VerificationStatut;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVerificationRequest;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        return [
            'verification_statut' => $user->verification_statut,
            'verification_rejet_raison' => $user->verification_rejet_raison,
            'verified_at' => $user->verified_at,
        ];
    }

    public function store(StoreVerificationRequest $request)
    {
        $user = $request->user();

        abort_if($user->estVerifie(), 422, 'Ton identité est déjà vérifiée.');

        $recto = $request->file('recto');
        $verso = $request->file('verso');

        $rectoPath = $recto->storeAs('cnib/'.$user->id, 'recto.'.$recto->extension(), 'local');
        $versoPath = $verso->storeAs('cnib/'.$user->id, 'verso.'.$verso->extension(), 'local');

        $user->update([
            'cnib_recto' => $rectoPath,
            'cnib_verso' => $versoPath,
            'verification_statut' => VerificationStatut::EnAttente,
            'verification_rejet_raison' => null,
        ]);

        return [
            'verification_statut' => $user->verification_statut,
            'verification_rejet_raison' => $user->verification_rejet_raison,
        ];
    }
}
