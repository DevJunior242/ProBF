<?php

namespace Database\Seeders;

use App\Models\MoyenPaiement;
use Illuminate\Database\Seeder;

class MoyenPaiementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Numéros placeholders désactivés par défaut : à configurer avec les vrais
     * numéros depuis l'espace admin avant d'activer.
     */
    public function run(): void
    {
        $moyens = [
            ['nom' => 'Orange Money', 'numero' => '+226 00 00 00 00', 'ordre' => 1],
            ['nom' => 'Moov Money', 'numero' => '+226 00 00 00 00', 'ordre' => 2],
        ];

        foreach ($moyens as $moyen) {
            MoyenPaiement::firstOrCreate(
                ['nom' => $moyen['nom']],
                [
                    'numero' => $moyen['numero'],
                    'nom_compte' => 'ProBF',
                    'instructions' => 'À configurer : remplace ce numéro par le vrai numéro de dépôt.',
                    'actif' => false,
                    'ordre' => $moyen['ordre'],
                ]
            );
        }
    }
}
