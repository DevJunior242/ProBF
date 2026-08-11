<?php

namespace App\Notifications;

use App\Models\Demande;
use Illuminate\Notifications\Notification;

class NouvelleDemandeExpressNotification extends Notification
{
    public function __construct(private readonly Demande $demande)
    {
        //
    }

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toArray(mixed $notifiable): array
    {
        return [
            'title' => 'Demande Express 🔥',
            'message' => "{$this->demande->client->nom} cherche un {$this->demande->metier->nom} à {$this->demande->quartier->nom} — réponds vite, c'est une demande payée.",
            'demande_id' => $this->demande->id,
        ];
    }
}
