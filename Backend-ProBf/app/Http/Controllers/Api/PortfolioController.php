<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'photo_avant' => ['required', 'string'],
            'photo_apres' => ['nullable', 'string'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $portfolio = $request->user()->portfolios()->create($data);

        return response()->json($portfolio, 201);
    }

    public function destroy(Request $request, Portfolio $portfolio)
    {
        abort_if($portfolio->user_id !== $request->user()->id, 403);

        $portfolio->delete();

        return response()->json(status: 204);
    }
}
