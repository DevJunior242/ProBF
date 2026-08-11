<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['fournisseur_id', 'metier_id', 'categorie_id', 'nom', 'prix', 'photo'])]
class Produit extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'prix' => 'decimal:2',
        ];
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'fournisseur_id');
    }

    public function metier(): BelongsTo
    {
        return $this->belongsTo(Metier::class);
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(CategorieProduit::class, 'categorie_id');
    }

    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }
}
