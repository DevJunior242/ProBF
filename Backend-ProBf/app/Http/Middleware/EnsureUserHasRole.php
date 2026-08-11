<?php

namespace App\Http\Middleware;

use App\Enums\RoleNom;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! $request->user()?->hasRole(RoleNom::from($role))) {
            abort(403, "Accès réservé au rôle {$role}.");
        }

        return $next($request);
    }
}
