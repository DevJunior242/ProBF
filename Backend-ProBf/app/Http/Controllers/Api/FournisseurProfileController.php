<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FournisseurProfileController extends Controller
{
    public function show(Request $request)
    {
        return $request->user()->fournisseurProfile;
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'nom_boutique' => ['required', 'string', 'max:255'],
            'adresse' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'string'],
        ]);

        return $request->user()->fournisseurProfile()->updateOrCreate([], $data);
    }
}
