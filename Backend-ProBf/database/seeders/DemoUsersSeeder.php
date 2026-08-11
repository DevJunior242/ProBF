<?php

namespace Database\Seeders;

use App\Enums\RoleNom;
use App\Enums\StatutDispo;
use App\Models\Metier;
use App\Models\Produit;
use App\Models\Quartier;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $metiers = Metier::all();
        $quartiers = Quartier::all();

        $roleClient = Role::where('nom', RoleNom::Client)->firstOrFail();
        $rolePro = Role::where('nom', RoleNom::Pro)->firstOrFail();
        $roleFournisseur = Role::where('nom', RoleNom::Fournisseur)->firstOrFail();

        User::factory()->count(50)->create()->each(function (User $user) use ($roleClient) {
            $user->roles()->attach($roleClient);
        });

        User::factory()->count(35)->create()->each(function (User $user) use ($rolePro, $metiers, $quartiers) {
            $user->roles()->attach($rolePro);
            $user->metiers()->attach($metiers->random(random_int(1, 2))->pluck('id'));
            $user->quartiers()->attach($quartiers->random(random_int(1, 2))->pluck('id'));

            $user->profile()->create([
                'bio' => fake()->sentence(12),
                'badge_verifie' => fake()->boolean(30),
                'statut_dispo' => fake()->randomElement([StatutDispo::Disponible, StatutDispo::SurRdv]),
                'note_moyenne' => fake()->randomFloat(2, 3, 5),
                'nb_avis' => fake()->numberBetween(0, 40),
            ]);
        });

        User::factory()->count(15)->create()->each(function (User $user) use ($roleFournisseur, $metiers) {
            $user->roles()->attach($roleFournisseur);

            $user->fournisseurProfile()->create([
                'nom_boutique' => fake()->company(),
                'adresse' => fake()->streetAddress(),
            ]);

            Produit::factory()
                ->count(random_int(1, 3))
                ->for($user, 'fournisseur')
                ->create(['metier_id' => $metiers->random()->id]);
        });
    }
}
