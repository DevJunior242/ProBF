<?php

namespace Database\Seeders;

use App\Enums\RoleNom;
use App\Models\Boost;
use App\Models\Metier;
use App\Models\Profile;
use App\Models\Quartier;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed 50 clients, 50 pros (profil + métiers + quartiers), et boost
     * une partie des pros pour peupler la démo.
     */
    public function run(): void
    {
        $clientRole = Role::where('nom', RoleNom::Client)->firstOrFail();
        $proRole = Role::where('nom', RoleNom::Pro)->firstOrFail();
        $metierIds = Metier::pluck('id')->all();
        $quartierIds = Quartier::pluck('id')->all();

        $clients = User::factory()->count(50)->create();
        foreach ($clients as $client) {
            $client->roles()->attach($clientRole->id);
        }

        $pros = User::factory()->count(50)->create();
        foreach ($pros as $pro) {
            $pro->roles()->attach($proRole->id);

            $profile = Profile::create([
                'user_id' => $pro->id,
                'bio' => fake()->sentence(12),
                'badge_verifie' => fake()->boolean(30),
                'statut_dispo' => fake()->randomElement([1, 2]),
            ]);
            $profile->note_moyenne = fake()->randomFloat(2, 3.5, 5);
            $profile->nb_avis = fake()->numberBetween(0, 40);
            $profile->save();

            $pro->metiers()->attach(fake()->randomElements($metierIds, rand(1, 3)));
            $pro->quartiers()->attach(fake()->randomElements($quartierIds, rand(1, 2)));
        }

        $boostes = $pros->random(15);
        foreach ($boostes as $pro) {
            Boost::activerPour($pro, rand(1, 72));
        }

        $this->command?->info('50 clients, 50 pros, 15 boosts créés.');
    }
}
