<?php

namespace Database\Seeders;

use App\Models\CategorieProduit;
use App\Models\Metier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorieProduitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoriesParMetier = [
            'electricien' => ['Câbles & fils', 'Interrupteurs & prises', 'Disjoncteurs & tableaux', 'Luminaires', 'Outillage électrique'],
            'plombier' => ['Tuyauterie', 'Raccords & vannes', 'Robinetterie', 'Sanitaires (WC, lavabos, douches)', 'Pompes & chauffe-eau'],
            'froid-climatisation' => ['Climatiseurs', 'Groupes froids', 'Gaz réfrigérant', 'Pièces détachées', 'Ventilation'],
        ];

        foreach ($categoriesParMetier as $slugMetier => $categories) {
            $metier = Metier::where('slug', $slugMetier)->first();

            foreach ($categories as $nom) {
                CategorieProduit::firstOrCreate(
                    ['slug' => Str::slug($nom)],
                    ['nom' => $nom, 'metier_id' => $metier?->id]
                );
            }
        }
    }
}
