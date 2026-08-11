<?php

namespace App\Models;

use App\Enums\StatutRetrait;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['ambassadeur_id', 'montant', 'statut', 'valide_par_admin_id'])]
class Retrait extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'statut' => StatutRetrait::class,
            'montant' => 'decimal:2',
        ];
    }

    public function ambassadeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ambassadeur_id');
    }

    public function adminValidateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par_admin_id');
    }
}
