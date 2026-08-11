<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return [
            'notifications' => $request->user()->notifications()->latest()->limit(30)->get(),
            'non_lues' => $request->user()->unreadNotifications()->count(),
        ];
    }

    public function marquerLues(Request $request)
    {
        $data = $request->validate([
            'ids' => ['nullable', 'array'],
            'ids.*' => ['string'],
        ]);

        $query = $request->user()->unreadNotifications();

        if (! empty($data['ids'])) {
            $query->whereIn('id', $data['ids']);
        }

        $query->update(['read_at' => now()]);

        return response()->json(['message' => 'OK']);
    }

    public function destroy(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['string'],
        ]);

        $request->user()->notifications()->whereIn('id', $data['ids'])->delete();

        return response()->json(status: 204);
    }
}
