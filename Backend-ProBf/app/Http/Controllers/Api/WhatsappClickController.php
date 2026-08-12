<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WhatsappClick;
use Illuminate\Http\Request;

class WhatsappClickController extends Controller
{
    public function store(Request $request)
    {
        abort_if(! $request->user()->estVerifie(), 403, "Tu dois d'abord vérifier ton identité (CNIB) pour contacter un pro.");

        $data = $request->validate([
            'pro_id' => ['required', 'exists:users,id'],
        ]);

        $pro = User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Pro))->findOrFail($data['pro_id']);

        $click = WhatsappClick::create([
            'pro_id' => $data['pro_id'],
            'client_id' => $request->user()->id,
        ]);

        return response()->json([
            'id' => $click->id,
            'telephone' => $pro->telephone,
        ], 201);
    }
}
