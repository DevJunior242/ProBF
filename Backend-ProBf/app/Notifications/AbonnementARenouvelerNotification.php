<?php

namespace App\Notifications;

use App\Models\Abonnement;
use Illuminate\Notifications\Notification;

class AbonnementARenouvelerNotification extends Notification
{
    public function __construct(
        private readonly Abonnement $abonnement,
        private readonly bool $profilMasque,
        private readonly int $joursRestants,
    ) {
        //
    }

    public function via(mixed $notifiable): array
    {
        return ['database'];
    }

    public function toArray(mixed $notifiable): array
    {
        $message = $this->profilMasque
            ? 'Ton abonnement a expiré et ton profil est masqué des recherches. Règle ton abonnement pour redevenir visible.'
            : "Ton abonnement expire dans {$this->joursRestants} jour".($this->joursRestants > 1 ? 's' : '').", pense à le renouveler pour rester visible.";

        return [
            'title' => 'Abonnement à renouveler',
            'message' => $message,
            'lien' => '/abonnement',
            'abonnement_id' => $this->abonnement->id,
        ];
    }
}
