<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleNom;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $rolesAutorises = [RoleNom::Client->value, RoleNom::Pro->value, RoleNom::Fournisseur->value];

        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'telephone' => ['required', 'string', 'unique:users,telephone'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'roles' => ['nullable', 'array'],
            'roles.*' => [Rule::in($rolesAutorises)],
            // rétrocompat : l'ancien champ "role" (singulier) est encore accepté
            'role' => ['nullable', Rule::in($rolesAutorises)],
            'cgu_accepted' => ['required', 'accepted'],
        ]);

        $user = User::create([
            'nom' => $data['nom'],
            'telephone' => $data['telephone'],
            'email' => $data['email'],
            'password' => $data['password'],
            'cgu_accepted_at' => now(),
        ]);

        $nomsRoles = $data['roles'] ?? array_filter([$data['role'] ?? null]);
        $nomsRoles = empty($nomsRoles) ? [RoleNom::Client->value] : array_unique($nomsRoles);

        $roleIds = Role::whereIn('nom', array_map(fn ($r) => RoleNom::from($r), $nomsRoles))->pluck('id');
        $user->roles()->attach($roleIds);

        event(new Registered($user));

        return response()->json([
            'user' => $user->load('roles'),
            'token' => $user->createToken('api')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'identifiant' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('telephone', $data['identifiant'])
            ->orWhere('email', $data['identifiant'])
            ->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'identifiant' => ['Identifiants incorrects.'],
            ]);
        }

        return response()->json([
            'user' => $user->load('roles'),
            'token' => $user->createToken('api')->plainTextToken,
        ]);
    }

    public function ajouterRole(Request $request)
    {
        $data = $request->validate([
            'role' => ['required', Rule::in([RoleNom::Pro->value, RoleNom::Fournisseur->value])],
        ], [
            'role.required' => 'Précise quel rôle ajouter.',
            'role.in' => 'Rôle invalide.',
        ]);

        $user = $request->user();
        $roleNom = RoleNom::from($data['role']);

        abort_if($user->hasRole($roleNom), 422, 'Tu as déjà ce rôle sur ton compte.');

        $role = Role::where('nom', $roleNom)->firstOrFail();
        $user->roles()->attach($role);

        return $user->load('roles');
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function verifyEmail(Request $request, string $id, string $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403, 'Lien de vérification invalide.');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return response()->json(['message' => 'Email vérifié avec succès.']);
    }

    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if (! $user->email) {
            abort(422, "Aucun email associé à ce compte.");
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification renvoyé.']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        return response()->json(['message' => __($status)]);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => $password])->save();
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => [__($status)]]);
        }

        return response()->json(['message' => __($status)]);
    }
}
