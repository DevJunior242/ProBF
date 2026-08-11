<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatutRetrait;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRetraitRequest;
use App\Models\Retrait;
use App\Models\User;
use App\Notifications\NouvelleDemandeRetraitNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

class RetraitController extends Controller
{
    public function store(StoreRetraitRequest $request)
    {
        $retrait = $request->user()->retraits()->create([
            'montant' => $request->user()->soldeAmbassadeur(),
            'statut' => StatutRetrait::EnAttente,
        ]);

        Notification::send(User::admins(), new NouvelleDemandeRetraitNotification($retrait));

        return response()->json($retrait, 201);
    }

    public function index()
    {
        return Retrait::with('ambassadeur')
            ->where('statut', StatutRetrait::EnAttente)
            ->latest()
            ->get();
    }

    public function mesRetraits(Request $request)
    {
        return $request->user()->retraits()->latest()->get();
    }

    public function valider(Request $request, Retrait $retrait)
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['valider', 'rejeter'])],
        ], [
            'action.required' => 'Précise si tu valides ou rejettes ce retrait.',
            'action.in' => 'Action invalide.',
        ]);

        abort_if($retrait->statut !== StatutRetrait::EnAttente, 422, 'Ce retrait a déjà été traité.');

        $retrait->update([
            'statut' => $data['action'] === 'valider' ? StatutRetrait::Valide : StatutRetrait::Rejete,
            'valide_par_admin_id' => $request->user()->id,
        ]);

        return $retrait;
    }
}
