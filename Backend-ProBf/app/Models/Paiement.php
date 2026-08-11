<?php

namespace App\Models;

use App\Enums\StatutPaiement;
use App\Enums\TypeAbonnement;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'moyen_paiement_id', 'abonnement_id', 'plan_abonnement_id', 'boost_id', 'demande_id', 'promo_id', 'type', 'contexte', 'montant', 'reference_transaction', 'preuve', 'statut', 'valide_par_admin_id'])]
class Paiement extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'type' => TypeAbonnement::class,
            'statut' => StatutPaiement::class,
            'montant' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function abonnement(): BelongsTo
    {
        return $this->belongsTo(Abonnement::class);
    }

    public function moyenPaiement(): BelongsTo
    {
        return $this->belongsTo(MoyenPaiement::class);
    }

    public function planAbonnement(): BelongsTo
    {
        return $this->belongsTo(PlanAbonnement::class);
    }

    public function boost(): BelongsTo
    {
        return $this->belongsTo(Boost::class);
    }

    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }

    public function promo(): BelongsTo
    {
        return $this->belongsTo(Promo::class);
    }

    public function adminValidateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par_admin_id');
    }
}
