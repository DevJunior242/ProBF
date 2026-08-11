<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CategorieProduit;
use Illuminate\Http\Request;

class CategorieProduitController extends Controller
{
    public function index(Request $request)
    {
        return CategorieProduit::query()
            ->when($request->query('metier_id'), fn ($q, $id) => $q->where('metier_id', $id))
            ->orderBy('nom')
            ->get();
    }
}
