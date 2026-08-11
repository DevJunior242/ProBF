<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['metier_id', 'nom', 'slug'])]
class CategorieProduit extends Model
{
    use HasUuids;

    protected $table = 'categories_produit';

    public function metier(): BelongsTo
    {
        return $this->belongsTo(Metier::class);
    }

    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class, 'categorie_id');
    }
}
