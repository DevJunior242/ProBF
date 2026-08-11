<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Http\Controllers\Controller;
use App\Models\Avis;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'pro_id' => ['required', 'exists:users,id'],
            'note' => ['required', 'integer', 'min:1', 'max:5'],
            'commentaire' => ['nullable', 'string', 'max:1000'],
        ]);

        $pro = User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Pro))->findOrFail($data['pro_id']);

        abort_if($pro->id === $request->user()->id, 422, "Tu ne peux pas laisser un avis sur toi-même.");

        $avis = $request->user()->avisDonnes()->create([
            'pro_id' => $pro->id,
            'note' => $data['note'],
            'commentaire' => $data['commentaire'] ?? null,
        ]);

        $this->recalculerNoteMoyenne($pro);

        return response()->json($avis, 201);
    }

    public function reponse(Request $request, Avis $avis)
    {
        abort_if($avis->pro_id !== $request->user()->id, 403);

        $data = $request->validate([
            'reponse_pro' => ['required', 'string', 'max:1000'],
        ]);

        $avis->update($data);

        return $avis;
    }

    private function recalculerNoteMoyenne(User $pro): void
    {
        $stats = $pro->avisRecus()->selectRaw('avg(note) as moyenne, count(*) as total')->first();

        Profile::where('user_id', $pro->id)->update([
            'note_moyenne' => round((float) $stats->moyenne, 2),
            'nb_avis' => $stats->total,
        ]);
    }
}
