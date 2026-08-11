<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WhatsappClick;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WhatsappClickController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'pro_id' => ['required', 'exists:users,id'],
        ]);

        User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Pro))->findOrFail($data['pro_id']);

        $click = WhatsappClick::create([
            'pro_id' => $data['pro_id'],
            'client_id' => Auth::guard('sanctum')->user()?->id,
        ]);

        return response()->json($click, 201);
    }
}
