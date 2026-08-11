<?php

namespace App\Models;

use App\Enums\TypeAbonnement;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['type', 'nom', 'duree_jours', 'montant', 'actif', 'ordre'])]
class PlanAbonnement extends Model
{
    use HasUuids;

    protected $table = 'plans_abonnement';

    protected function casts(): array
    {
        return [
            'type' => TypeAbonnement::class,
            'montant' => 'decimal:2',
            'actif' => 'boolean',
        ];
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }
}
