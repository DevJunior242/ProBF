<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMetierRequest extends FormRequest
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
            'nom' => ['required', 'string', 'min:2', 'max:100'],
        ];
    }

    /**
     * Messages d'erreur en français.
     */
    public function messages(): array
    {
        return [
            'nom.required' => 'Précise le nom du métier.',
            'nom.min' => 'Le nom du métier est trop court.',
            'nom.max' => 'Le nom du métier est trop long (100 caractères max).',
        ];
    }
}
