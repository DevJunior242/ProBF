<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['fournisseur_id', 'produit_id', 'prix_promo', 'texte', 'expires_at'])]
class Promo extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'prix_promo' => 'decimal:2',
            'expires_at' => 'datetime',
        ];
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'fournisseur_id');
    }

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }
}
