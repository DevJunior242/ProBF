<?php

namespace App\Models;

use App\Enums\StatutDispo;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'bio', 'avatar', 'badge_verifie', 'masque', 'masque_motif', 'statut_dispo'])]
class Profile extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'badge_verifie' => 'boolean',
            'masque' => 'boolean',
            'statut_dispo' => StatutDispo::class,
            'note_moyenne' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
