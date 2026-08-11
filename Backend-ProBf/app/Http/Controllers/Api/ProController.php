<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Enums\StatutDispo;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ProController extends Controller
{
    public function index(Request $request)
    {
        $pros = User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Pro))
            ->with(['profile', 'metiers', 'quartiers'])
            ->when($request->query('recherche'), fn ($q, $recherche) => $q->where('nom', 'like', "%{$recherche}%"))
            ->when($request->query('metier'), fn ($q, $slug) => $q->whereHas('metiers', fn ($m) => $m->where('slug', $slug)))
            ->when($request->query('quartier'), fn ($q, $quartierId) => $q->whereHas('quartiers', fn ($qu) => $qu->where('quartiers.id', $quartierId)))
            ->when($request->boolean('dispo'), fn ($q) => $q->whereHas('profile', fn ($p) => $p->where('statut_dispo', StatutDispo::Disponible)))
            ->join('profiles', 'profiles.user_id', '=', 'users.id')
            ->where('profiles.masque', false)
            ->withExists(['boosts as est_boost_actif' => fn ($q) => $q->where('expires_at', '>=', now())])
            ->orderByDesc('est_boost_actif')
            ->orderByDesc('profiles.badge_verifie')
            ->orderByDesc('profiles.note_moyenne')
            ->addSelect('users.*')
            ->paginate(20);

        return $pros;
    }

    public function show(string $id)
    {
        $pro = User::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Pro))
            ->with(['profile', 'metiers', 'quartiers', 'portfolios', 'avisRecus.client'])
            ->findOrFail($id);

        return $pro;
    }
}
