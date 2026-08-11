<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nom', 'numero', 'nom_compte', 'instructions', 'logo', 'actif', 'ordre'])]
class MoyenPaiement extends Model
{
    use HasUuids;

    protected $table = 'moyens_paiement';

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }
}
