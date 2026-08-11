<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nom', 'code'])]
class Pays extends Model
{
    use HasUuids;

    public function villes(): HasMany
    {
        return $this->hasMany(Ville::class);
    }
}
