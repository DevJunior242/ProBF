<?php

namespace App\Notifications;

use App\Models\Retrait;
use Illuminate\Notifications\Notification;

class NouvelleDemandeRetraitNotification extends Notification
{
    public function __construct(private readonly Retrait $retrait)
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
            'title' => 'Demande de retrait 💰',
            'message' => "{$this->retrait->ambassadeur->nom} demande un retrait de {$this->retrait->montant} F CFA.",
            'retrait_id' => $this->retrait->id,
        ];
    }
}
