<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMetierRequest;
use App\Models\Metier;
use Illuminate\Support\Str;

class MetierController extends Controller
{
    public function index()
    {
        return Metier::orderBy('nom')->get();
    }

    public function store(StoreMetierRequest $request)
    {
        $nom = trim($request->validated('nom'));

        $metier = Metier::firstOrCreate(
            ['slug' => Str::slug($nom)],
            ['nom' => $nom]
        );

        return response()->json($metier, 201);
    }
}
