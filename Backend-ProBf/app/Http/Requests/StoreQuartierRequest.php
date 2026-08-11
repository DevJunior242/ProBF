<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuartierRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'ville' => ['required', 'string', 'min:2', 'max:100'],
            'nom' => ['required', 'string', 'min:2', 'max:100'],
        ];
    }

    /**
     * Messages d'erreur en français.
     */
    public function messages(): array
    {
        return [
            'ville.required' => 'Précise la ville.',
            'ville.min' => 'Le nom de la ville est trop court.',
            'ville.max' => 'Le nom de la ville est trop long (100 caractères max).',
            'nom.required' => 'Précise le nom du quartier.',
            'nom.min' => 'Le nom du quartier est trop court.',
            'nom.max' => 'Le nom du quartier est trop long (100 caractères max).',
        ];
    }
}
