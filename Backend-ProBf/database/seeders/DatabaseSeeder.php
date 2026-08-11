<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PaysSeeder::class,
            VilleSeeder::class,
            QuartierSeeder::class,
            MetierSeeder::class,
            CategorieProduitSeeder::class,
            AdminUserSeeder::class,
            MoyenPaiementSeeder::class,
            PlanAbonnementSeeder::class,
        ]);
    }
}
