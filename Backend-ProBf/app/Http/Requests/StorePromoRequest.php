<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePromoRequest extends FormRequest
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
            'produit_id' => [
                'required',
                Rule::exists('produits', 'id')->where('fournisseur_id', $this->user()->id),
            ],
            'prix_promo' => ['nullable', 'numeric', 'min:0'],
            'texte' => ['nullable', 'string', 'max:255'],
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
            'produit_id.required' => 'Choisis le produit à mettre en avant.',
            'produit_id.exists' => "Ce produit n'existe pas ou ne t'appartient pas.",
            'prix_promo.numeric' => 'Le prix promo doit être un nombre.',
            'prix_promo.min' => 'Le prix promo ne peut pas être négatif.',
            'texte.max' => 'Le texte de la promo est trop long (255 caractères max).',
            'moyen_paiement_id.exists' => "Ce moyen de paiement n'existe pas.",
            'reference_transaction.max' => 'La référence de transaction est trop longue.',
        ];
    }
}
