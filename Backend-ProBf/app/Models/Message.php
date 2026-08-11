<?php

namespace App\Models;

use App\Enums\TypeMessage;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['conversation_id', 'sender_id', 'type', 'contenu', 'fichier_url', 'fichier_nom'])]
class Message extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'type' => TypeMessage::class,
            'read_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
