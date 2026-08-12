<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Conversation::where('client_id', $user->id)
            ->orWhere('pro_id', $user->id)
            ->with(['client', 'pro', 'dernierMessage'])
            ->withCount(['messages as non_lus_count' => function ($query) use ($user) {
                $query->whereNull('read_at')->where('sender_id', '!=', $user->id);
            }])
            ->get()
            ->sortByDesc(fn (Conversation $c) => $c->dernierMessage?->created_at ?? $c->created_at)
            ->values();
    }

    public function store(Request $request)
    {
        abort_if(! $request->user()->estVerifie(), 403, "Tu dois d'abord vérifier ton identité (CNIB) pour contacter quelqu'un.");

        $data = $request->validate([
            'pro_id' => ['required_without:client_id', 'nullable', 'exists:users,id'],
            'client_id' => ['required_without:pro_id', 'nullable', 'exists:users,id'],
        ]);

        if (! empty($data['pro_id'])) {
            // "pro_id" désigne le côté prestataire de la conversation : un Pro ou un Fournisseur.
            $pro = User::whereHas('roles', fn ($q) => $q->whereIn('nom', [RoleNom::Pro, RoleNom::Fournisseur]))
                ->findOrFail($data['pro_id']);
            abort_if($pro->id === $request->user()->id, 422, 'Tu ne peux pas te contacter toi-même.');

            $conversation = Conversation::firstOrCreate([
                'client_id' => $request->user()->id,
                'pro_id' => $pro->id,
            ]);
        } else {
            $client = User::findOrFail($data['client_id']);
            abort_if($client->id === $request->user()->id, 422, 'Tu ne peux pas te contacter toi-même.');

            $conversation = Conversation::firstOrCreate([
                'client_id' => $client->id,
                'pro_id' => $request->user()->id,
            ]);
        }

        return $conversation->load(['client', 'pro']);
    }
}
