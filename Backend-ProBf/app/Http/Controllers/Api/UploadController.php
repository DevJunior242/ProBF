<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UploadController extends Controller
{
    /**
     * Documents autorisés dans la messagerie, en plus des images.
     * Pas de vidéo pour la V1.
     */
    private const EXTENSIONS_DOCUMENT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

    public function store(Request $request)
    {
        $type = $request->input('type', 'divers');
        $estMessage = $type === 'message';

        $data = $request->validate([
            'photo' => [
                'required',
                'file',
                $estMessage ? 'mimes:jpg,jpeg,png,webp,'.implode(',', self::EXTENSIONS_DOCUMENT) : 'image',
                'max:'.($estMessage ? 15360 : 5120),
            ],
            'type' => ['nullable', Rule::in(['avatar', 'portfolio', 'produit', 'logo', 'preuve', 'message'])],
        ]);

        $fichier = $request->file('photo');
        $path = $fichier->store('uploads/'.$type, 'public');

        return response()->json([
            'url' => url(Storage::url($path)),
            'nom_original' => $fichier->getClientOriginalName(),
            'est_document' => in_array(strtolower($fichier->getClientOriginalExtension()), self::EXTENSIONS_DOCUMENT),
        ], 201);
    }
}
