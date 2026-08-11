<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRetraitRequest extends FormRequest
{
    const SEUIL_MINIMUM_FCFA = 500;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->soldeAmbassadeur() >= self::SEUIL_MINIMUM_FCFA;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [];
    }

    /**
     * Message si la demande est refusée (solde insuffisant).
     */
    protected function failedAuthorization()
    {
        throw new \Illuminate\Auth\Access\AuthorizationException(
            'Ton solde doit atteindre au moins '.self::SEUIL_MINIMUM_FCFA.' F CFA pour demander un retrait.'
        );
    }
}
