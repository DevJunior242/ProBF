<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVerificationRequest extends FormRequest
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
            'recto' => ['required', 'file', 'image', 'max:5120'],
            'verso' => ['required', 'file', 'image', 'max:5120'],
        ];
    }

    /**
     * Messages d'erreur en français.
     */
    public function messages(): array
    {
        return [
            'recto.required' => "La photo recto de ta CNIB est obligatoire.",
            'recto.image' => 'Le recto doit être une image.',
            'recto.max' => "L'image recto ne doit pas dépasser 5 Mo.",
            'verso.required' => "La photo verso de ta CNIB est obligatoire.",
            'verso.image' => 'Le verso doit être une image.',
            'verso.max' => "L'image verso ne doit pas dépasser 5 Mo.",
        ];
    }
}
