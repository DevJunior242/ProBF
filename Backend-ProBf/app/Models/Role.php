<?php

namespace App\Models;

use App\Enums\RoleNom;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['nom'])]
class Role extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'nom' => RoleNom::class,
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
