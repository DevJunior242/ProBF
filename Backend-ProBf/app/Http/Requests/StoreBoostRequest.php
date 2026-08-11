<?php

namespace App\Http\Requests;

use App\Enums\TypeAbonnement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBoostRequest extends FormRequest
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
            'type' => ['required', Rule::in([TypeAbonnement::Pro->value, TypeAbonnement::Fournisseur->value])],
            'moyen_paiement_id' => ['nullable', 'exists:moyens_paiement,id'],
            'reference_transaction' => ['nullable', 'string', 'max:255'],
            'preuve' => ['nullable', 'string'],
        ];
    }

    /**
     * Messages d'erreur en français.
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Précise si tu veux booster ton profil Pro ou Fournisseur.',
            'type.in' => 'Type de boost invalide.',
            'moyen_paiement_id.exists' => "Ce moyen de paiement n'existe pas.",
            'reference_transaction.string' => 'La référence de transaction est invalide.',
            'reference_transaction.max' => 'La référence de transaction est trop longue.',
            'preuve.string' => 'La preuve envoyée est invalide.',
        ];
    }
}
