<?php

namespace Database\Seeders;

use App\Enums\RoleNom;
use App\Models\CategorieProduit;
use App\Models\FournisseurProfile;
use App\Models\Produit;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoFournisseursSeeder extends Seeder
{
    /**
     * Seed 50 fournisseurs de démo (boutique + 3 à 8 produits chacun).
     */
    public function run(): void
    {
        $fournisseurRole = Role::where('nom', RoleNom::Fournisseur)->firstOrFail();
        $categories = CategorieProduit::all();

        $fournisseurs = User::factory()->count(50)->create();
        foreach ($fournisseurs as $fournisseur) {
            $fournisseur->roles()->attach($fournisseurRole->id);

            FournisseurProfile::create([
                'user_id' => $fournisseur->id,
                'nom_boutique' => fake()->company(),
                'adresse' => fake()->streetAddress(),
            ]);

            foreach (range(1, rand(3, 8)) as $i) {
                $categorie = $categories->isNotEmpty() ? $categories->random() : null;

                Produit::create([
                    'fournisseur_id' => $fournisseur->id,
                    'metier_id' => $categorie?->metier_id,
                    'categorie_id' => $categorie?->id,
                    'nom' => ucfirst(fake()->words(3, true)),
                    'prix' => fake()->numberBetween(500, 25000),
                ]);
            }
        }

        $this->command?->info('50 fournisseurs et leurs produits créés.');
    }
}
