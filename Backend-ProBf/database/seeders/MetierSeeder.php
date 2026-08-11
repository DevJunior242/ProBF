<?php

namespace Database\Seeders;

use App\Models\Metier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MetierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $metiers = [
            'Électricien', 'Plombier', 'Froid & Climatisation', 'Maçon', 'Menuisier',
            'Peintre en bâtiment', 'Soudeur / Métallier', 'Mécanicien auto', 'Carreleur',
            'Plaquiste', 'Serrurier', 'Jardinier / Paysagiste', 'Couturier / Tailleur',
            'Coiffeur / Esthéticienne', 'Nettoyage / Ménage', 'Déménagement', 'Vitrier',
            'Photographe', 'Informatique / Réparation',
        ];

        foreach ($metiers as $nom) {
            Metier::firstOrCreate(['slug' => Str::slug($nom)], ['nom' => $nom]);
        }
    }
}
