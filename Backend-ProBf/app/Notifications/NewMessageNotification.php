<?php

namespace App\Notifications;

use App\Enums\TypeMessage;
use App\Models\Message;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    public function __construct(private readonly Message $message)
    {
        //
    }

    public function via(mixed $notifiable): array
    {
        // Notification en base uniquement : pas d'email par message pour éviter le spam.
        return ['database'];
    }

    public function toArray(mixed $notifiable): array
    {
        $apercu = match ($this->message->type) {
            TypeMessage::Photo => 'a envoyé une photo',
            TypeMessage::Fichier => 'a envoyé un fichier'.($this->message->fichier_nom ? " ({$this->message->fichier_nom})" : ''),
            default => $this->message->contenu,
        };

        return [
            'title' => 'Nouveau message',
            'message' => $this->message->sender->nom.' : '.$apercu,
            'conversation_id' => $this->message->conversation_id,
            'message_id' => $this->message->id,
        ];
    }
}
