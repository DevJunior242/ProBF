<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['client_id', 'pro_id'])]
class Conversation extends Model
{
    use HasUuids;

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function pro(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pro_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function dernierMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function autreParticipant(User $user): User
    {
        return $user->id === $this->client_id ? $this->pro : $this->client;
    }
}
