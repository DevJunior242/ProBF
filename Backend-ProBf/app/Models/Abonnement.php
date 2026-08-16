<?php

namespace App\Models;

use App\Enums\StatutAbonnement;
use App\Enums\TypeAbonnement;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'type', 'statut', 'date_debut', 'date_fin', 'montant', 'est_essai'])]
class Abonnement extends Model
{
    use HasUuids;

    /**
     * Démarre un essai gratuit à l'ouverture d'un rôle Pro/Fournisseur, une
     * seule fois par type et par compte : si ce type a déjà eu un abonnement
     * (essai ou payant, actif ou expiré), on ne redonne pas d'essai.
     */
    public static function demarrerEssai(User $user, TypeAbonnement $type, int $days): ?self
    {
        $dejaEuUnAbonnement = $user->abonnements()->where('type', $type)->exists();

        if ($dejaEuUnAbonnement) {
            return null;
        }

        return $user->abonnements()->create([
            'type' => $type,
            'statut' => StatutAbonnement::Actif,
            'date_debut' => now(),
            'date_fin' => now()->addDays($days),
            'montant' => 0,
            'est_essai' => true,
        ]);
    }

    /**
     * Active un abonnement pour $days jours, en prolongeant l'abonnement actif
     * existant du même type s'il y en a un, sinon en créant un nouveau.
     */
    public static function extendFor(User $user, TypeAbonnement $type, int $days, float $montant = 0): self
    {
        $actif = $user->abonnements()
            ->where('type', $type)
            ->where('statut', StatutAbonnement::Actif)
            ->where('date_fin', '>=', now())
            ->latest('date_fin')
            ->first();

        if ($actif) {
            $actif->update(['date_fin' => Carbon::parse($actif->date_fin)->addDays($days)]);

            return $actif;
        }

        return $user->abonnements()->create([
            'type' => $type,
            'statut' => StatutAbonnement::Actif,
            'date_debut' => now(),
            'date_fin' => now()->addDays($days),
            'montant' => $montant,
        ]);
    }

    protected function casts(): array
    {
        return [
            'type' => TypeAbonnement::class,
            'statut' => StatutAbonnement::class,
            'date_debut' => 'date',
            'date_fin' => 'date',
            'montant' => 'decimal:2',
            'est_essai' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }
}
