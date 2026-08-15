<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use App\Models\Quartier;
use App\Models\Pays;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['pays_id', 'nom'])]
class Ville extends Model
{
    use HasUuids;

    public function pays(): BelongsTo
    {
        return $this->belongsTo(Pays::class);
    }

    public function quartiers(): HasMany
    {
        return $this->hasMany(Quartier::class);
    }
}
