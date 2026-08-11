<?php

namespace Database\Seeders;

use App\Enums\TypeAbonnement;
use App\Models\PlanAbonnement;
use Illuminate\Database\Seeder;

class PlanAbonnementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            ['type' => TypeAbonnement::Pro, 'nom' => 'Mensuel', 'duree_jours' => 30, 'montant' => 5000, 'ordre' => 1],
            ['type' => TypeAbonnement::Pro, 'nom' => 'Annuel', 'duree_jours' => 365, 'montant' => 50000, 'ordre' => 2],
            ['type' => TypeAbonnement::Fournisseur, 'nom' => 'Mensuel', 'duree_jours' => 30, 'montant' => 5000, 'ordre' => 1],
            ['type' => TypeAbonnement::Fournisseur, 'nom' => 'Annuel', 'duree_jours' => 365, 'montant' => 50000, 'ordre' => 2],
        ];

        foreach ($plans as $plan) {
            PlanAbonnement::firstOrCreate(
                ['type' => $plan['type'], 'nom' => $plan['nom']],
                [...$plan, 'actif' => true]
            );
        }
    }
}
