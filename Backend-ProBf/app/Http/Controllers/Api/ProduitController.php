<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produit;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    public function index(Request $request)
    {
        return Produit::with(['fournisseur.fournisseurProfile', 'metier', 'categorie'])
            ->when($request->query('fournisseur_id'), fn ($q, $id) => $q->where('fournisseur_id', $id))
            ->when($request->query('metier_id'), fn ($q, $id) => $q->where('metier_id', $id))
            ->when($request->query('categorie_id'), fn ($q, $id) => $q->where('categorie_id', $id))
            ->paginate(20);
    }

    public function store(Request $request)
    {
        abort_if(! $request->user()->estVerifie(), 403, "Tu dois d'abord vérifier ton identité (CNIB) pour publier un produit.");

        $data = $request->validate([
            'metier_id' => ['nullable', 'exists:metiers,id'],
            'categorie_id' => ['nullable', 'exists:categories_produit,id'],
            'nom' => ['required', 'string', 'max:255'],
            'prix' => ['required', 'numeric', 'min:0'],
            'photo' => ['nullable', 'string'],
        ]);

        $produit = $request->user()->produits()->create($data);

        return response()->json($produit->load('categorie'), 201);
    }

    public function update(Request $request, Produit $produit)
    {
        abort_if($produit->fournisseur_id !== $request->user()->id, 403);

        $data = $request->validate([
            'metier_id' => ['nullable', 'exists:metiers,id'],
            'categorie_id' => ['nullable', 'exists:categories_produit,id'],
            'nom' => ['sometimes', 'string', 'max:255'],
            'prix' => ['sometimes', 'numeric', 'min:0'],
            'photo' => ['nullable', 'string'],
        ]);

        $produit->update($data);

        return $produit;
    }

    public function destroy(Request $request, Produit $produit)
    {
        abort_if($produit->fournisseur_id !== $request->user()->id, 403);

        $produit->delete();

        return response()->json(status: 204);
    }
}
