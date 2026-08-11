<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nom', 'slug'])]
class Metier extends Model
{
    use HasUuids;

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class);
    }

    public function produits(): HasMany
    {
        return $this->hasMany(Produit::class);
    }
}
