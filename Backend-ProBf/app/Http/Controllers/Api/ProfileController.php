<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatutDispo;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $data = $request->validate([
            'bio' => ['nullable', 'string', 'max:2000'],
            'avatar' => ['nullable', 'string'],
            'metiers' => ['nullable', 'array'],
            'metiers.*' => ['exists:metiers,id'],
            'quartiers' => ['nullable', 'array'],
            'quartiers.*' => ['exists:quartiers,id'],
        ]);

        $user = $request->user();

        $profile = $user->profile()->updateOrCreate([], [
            'bio' => $data['bio'] ?? null,
            'avatar' => $data['avatar'] ?? null,
        ]);

        if (array_key_exists('metiers', $data)) {
            $user->metiers()->sync($data['metiers'] ?? []);
        }

        if (array_key_exists('quartiers', $data)) {
            $user->quartiers()->sync($data['quartiers'] ?? []);
        }

        return $profile->load('user.metiers', 'user.quartiers');
    }

    public function updateDispo(Request $request)
    {
        $data = $request->validate([
            'statut_dispo' => ['required', Rule::in([StatutDispo::Disponible->value, StatutDispo::SurRdv->value])],
        ]);

        $profile = $request->user()->profile()->updateOrCreate([], [
            'statut_dispo' => $data['statut_dispo'],
        ]);

        return $profile;
    }
}
