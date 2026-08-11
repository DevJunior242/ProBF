<?php

namespace App\Models;

use App\Enums\StatutInvitation;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['parrain_id', 'filleul_id', 'code', 'statut', 'recompense_appliquee', 'commission_montant'])]
class Invitation extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'statut' => StatutInvitation::class,
            'recompense_appliquee' => 'boolean',
        ];
    }

    public function parrain(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parrain_id');
    }

    public function filleul(): BelongsTo
    {
        return $this->belongsTo(User::class, 'filleul_id');
    }

    /**
     * Crédite une commission unique à l'ambassadeur de $filleul, s'il en a un
     * et qu'aucune commission n'a encore été créditée pour cette invitation.
     */
    public static function crediterCommissionPour(User $filleul, float $montant): void
    {
        $invitation = static::where('filleul_id', $filleul->id)->whereNull('commission_montant')->first();

        if (! $invitation) {
            return;
        }

        $invitation->update(['commission_montant' => round($montant, 2)]);
    }
}
