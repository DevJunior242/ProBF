<?php

namespace Database\Seeders;

use App\Models\Pays;
use App\Models\Ville;
use Illuminate\Database\Seeder;

class VilleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $burkina = Pays::where('code', 'BFA')->firstOrFail();

        foreach (['Ouagadougou', 'Bobo-Dioulasso'] as $nom) {
            Ville::firstOrCreate(['pays_id' => $burkina->id, 'nom' => $nom]);
        }
    }
}
