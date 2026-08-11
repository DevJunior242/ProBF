<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaiementRequest extends FormRequest
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
            'plan_abonnement_id' => ['required', 'exists:plans_abonnement,id'],
            'moyen_paiement_id' => ['nullable', 'exists:moyens_paiement,id'],
            'montant' => ['required', 'numeric', 'min:0'],
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
            'plan_abonnement_id.required' => 'Choisis un plan avant de continuer.',
            'plan_abonnement_id.exists' => "Ce plan n'existe pas ou plus.",
            'moyen_paiement_id.exists' => "Ce moyen de paiement n'existe pas.",
            'montant.required' => 'Indique le montant déposé.',
            'montant.numeric' => 'Le montant doit être un nombre.',
            'montant.min' => 'Le montant ne peut pas être négatif.',
            'reference_transaction.max' => 'La référence de transaction est trop longue.',
        ];
    }
}
