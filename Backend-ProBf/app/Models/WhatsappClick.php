<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['client_id', 'pro_id'])]
class WhatsappClick extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function pro(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pro_id');
    }
}
