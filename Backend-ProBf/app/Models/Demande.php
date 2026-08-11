<?php

namespace App\Models;

use App\Enums\StatutDemande;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['client_id', 'metier_id', 'quartier_id', 'description', 'urgence', 'statut'])]
class Demande extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'urgence' => 'boolean',
            'statut' => StatutDemande::class,
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function metier(): BelongsTo
    {
        return $this->belongsTo(Metier::class);
    }

    public function quartier(): BelongsTo
    {
        return $this->belongsTo(Quartier::class);
    }
}
