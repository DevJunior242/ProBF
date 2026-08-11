<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'expires_at'])]
class Boost extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Active un boost de $heures heures pour $user, en prolongeant le boost
     * actif existant s'il y en a un, sinon en créant un nouveau.
     */
    public static function activerPour(User $user, int $heures = 24): self
    {
        $actif = $user->boosts()->where('expires_at', '>=', now())->latest('expires_at')->first();

        if ($actif) {
            $actif->update(['expires_at' => $actif->expires_at->addHours($heures)]);

            return $actif;
        }

        return $user->boosts()->create([
            'expires_at' => now()->addHours($heures),
        ]);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
