<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDevisExpressRequest extends FormRequest
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
            'demande_id' => [
                'required',
                Rule::exists('demandes', 'id')->where('client_id', $this->user()->id),
            ],
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
            'demande_id.required' => 'Choisis la demande concernée.',
            'demande_id.exists' => "Cette demande n'existe pas ou ne t'appartient pas.",
            'moyen_paiement_id.exists' => "Ce moyen de paiement n'existe pas.",
            'reference_transaction.max' => 'La référence de transaction est trop longue.',
        ];
    }
}
