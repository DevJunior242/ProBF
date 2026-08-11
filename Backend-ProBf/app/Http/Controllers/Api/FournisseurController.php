<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    public function index(Request $request)
    {
        return User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Fournisseur))
            ->with('fournisseurProfile')
            ->when($request->query('metier'), fn ($q, $slug) => $q->whereHas('produits.metier', fn ($m) => $m->where('slug', $slug)))
            ->when($request->query('categorie'), fn ($q, $slug) => $q->whereHas('produits.categorie', fn ($c) => $c->where('slug', $slug)))
            ->withExists(['boosts as est_boost_actif' => fn ($q) => $q->where('expires_at', '>=', now())])
            ->orderByDesc('est_boost_actif')
            ->paginate(20);
    }

    public function show(string $id)
    {
        return User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Fournisseur))
            ->with(['fournisseurProfile', 'produits.metier', 'produits.categorie'])
            ->findOrFail($id);
    }
}
