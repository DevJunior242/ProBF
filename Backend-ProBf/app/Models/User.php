<?php

namespace App\Models;

use App\Enums\RoleNom;
use App\Enums\VerificationStatut;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['nom', 'telephone', 'email', 'password', 'cgu_accepted_at', 'cnib_recto', 'cnib_verso', 'verification_statut', 'verification_rejet_raison', 'verifie_par_admin_id', 'verified_at'])]
#[Hidden(['password', 'remember_token', 'cnib_recto', 'cnib_verso'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'whatsapp_otp_verified_at' => 'datetime',
            'email_verified_at' => 'datetime',
            'cgu_accepted_at' => 'datetime',
            'password' => 'hashed',
            'verification_statut' => VerificationStatut::class,
            'verified_at' => 'datetime',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasRole(RoleNom $role): bool
    {
        return $this->roles->contains('nom', $role);
    }

    public function estVerifie(): bool
    {
        return $this->verification_statut === VerificationStatut::Verifie;
    }

    public function verifiePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verifie_par_admin_id');
    }

    /**
     * Tous les comptes admin, pour leur envoyer des notifications ciblées.
     */
    public static function admins(): \Illuminate\Database\Eloquent\Collection
    {
        return static::whereHas('roles', fn ($q) => $q->where('nom', RoleNom::Admin))->get();
    }

    public function metiers(): BelongsToMany
    {
        return $this->belongsToMany(Metier::class);
    }

    public function quartiers(): BelongsToMany
    {
        return $this->belongsToMany(Quartier::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function fournisseurProfile(): HasOne
    {
        return $this->hasOne(FournisseurProfile::class);
    }

    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }

    public function avisRecus(): HasMany
    {
        return $this->hasMany(Avis::class, 'pro_id');
    }

    public function avisDonnes(): HasMany
    {
        return $this->hasMany(Avis::class, 'client_id');
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class, 'client_id');
    }

    public function invitationsEnvoyees(): HasMany
    {
        return $this->hasMany(Invitation::class, 'parrain_id');
    }

    public function invitationRecue(): HasOne
    {
        return $this->hasOne(Invitation::class, 'filleul_id');
    }

    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class, 'fournisseur_id');
    }

    public function abonnements(): HasMany
    {
        return $this->hasMany(Abonnement::class);
    }

    public function dernierAbonnement(): HasOne
    {
        return $this->hasOne(Abonnement::class)->latestOfMany('date_fin');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    public function boosts(): HasMany
    {
        return $this->hasMany(Boost::class);
    }

    public function retraits(): HasMany
    {
        return $this->hasMany(Retrait::class, 'ambassadeur_id');
    }

    /**
     * Solde disponible pour un retrait : commissions créditées - retraits déjà validés.
     */
    public function soldeAmbassadeur(): float
    {
        $commissions = $this->invitationsEnvoyees()->whereNotNull('commission_montant')->sum('commission_montant');
        $retraitsValides = $this->retraits()->where('statut', \App\Enums\StatutRetrait::Valide)->sum('montant');

        return (float) $commissions - (float) $retraitsValides;
    }

    public function conversationsClient(): HasMany
    {
        return $this->hasMany(Conversation::class, 'client_id');
    }

    public function conversationsPro(): HasMany
    {
        return $this->hasMany(Conversation::class, 'pro_id');
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification);
    }

    public function sendPasswordResetNotification(#[\SensitiveParameter] $token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
