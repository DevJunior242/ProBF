<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuartierRequest;
use App\Models\Demande;
use App\Models\Pays;
use App\Models\Quartier;
use App\Models\Ville;
use Illuminate\Http\Request;

class QuartierController extends Controller
{
    public function index(Request $request)
    {
        return Quartier::with('ville.pays')
            ->when($request->query('ville_id'), fn ($q, $villeId) => $q->where('ville_id', $villeId))
            ->orderBy('nom')
            ->get();
    }

    public function store(StoreQuartierRequest $request)
    {
        $data = $request->validated();

        $pays = Pays::firstOrFail();
        $ville = Ville::firstOrCreate(['pays_id' => $pays->id, 'nom' => trim($data['ville'])]);

        $quartier = Quartier::firstOrCreate(
            ['ville_id' => $ville->id, 'nom' => trim($data['nom'])],
            ['cree_par_id' => $request->user()->id]
        );

        return response()->json($quartier->load('ville.pays'), 201);
    }

    public function adminIndex()
    {
        return Quartier::with(['ville.pays', 'creePar'])
            ->whereNotNull('cree_par_id')
            ->latest()
            ->get();
    }

    public function destroy(Quartier $quartier)
    {
        $utilise = $quartier->users()->exists() || Demande::where('quartier_id', $quartier->id)->exists();

        abort_if($utilise, 422, "Ce quartier est déjà utilisé par des comptes ou des demandes, il ne peut pas être supprimé.");

        $quartier->delete();

        return response()->json(status: 204);
    }
}
