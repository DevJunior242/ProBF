<?php

namespace App\Http\Controllers\Api;

use App\Enums\TypeMessage;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MessageController extends Controller
{
    public function index(Request $request, Conversation $conversation)
    {
        $this->abortSaufParticipant($request, $conversation);

        $messages = $conversation->messages()->with('sender')->orderBy('created_at')->get();

        $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $request->user()->id)
            ->update(['read_at' => now()]);

        return $messages;
    }

    public function store(Request $request, Conversation $conversation)
    {
        $this->abortSaufParticipant($request, $conversation);

        $data = $request->validate([
            'type' => ['required', Rule::in([TypeMessage::Texte->value, TypeMessage::Photo->value, TypeMessage::Fichier->value])],
            'contenu' => ['required_if:type,'.TypeMessage::Texte->value, 'nullable', 'string', 'max:2000'],
            'fichier_url' => [
                'required_if:type,'.TypeMessage::Photo->value.','.TypeMessage::Fichier->value,
                'nullable',
                'string',
            ],
            'fichier_nom' => ['nullable', 'string', 'max:255'],
        ]);

        $message = $conversation->messages()->create([
            ...$data,
            'sender_id' => $request->user()->id,
        ]);

        $conversation->touch();

        $destinataire = $conversation->autreParticipant($request->user());
        $destinataire->notify(new NewMessageNotification($message));

        return response()->json($message->load('sender'), 201);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Message::whereHas('conversation', fn ($q) => $q->where('client_id', $user->id)->orWhere('pro_id', $user->id))
            ->whereNull('read_at')
            ->where('sender_id', '!=', $user->id)
            ->count();

        return response()->json(['count' => $count]);
    }

    private function abortSaufParticipant(Request $request, Conversation $conversation): void
    {
        abort_if(
            ! in_array($request->user()->id, [$conversation->client_id, $conversation->pro_id]),
            403
        );
    }
}
