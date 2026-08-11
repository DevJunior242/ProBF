<?php

namespace Database\Seeders;

use App\Enums\RoleNom;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoClientsSeeder extends Seeder
{
    /**
     * Seed 50 comptes clients de démo.
     */
    public function run(): void
    {
        $clientRole = Role::where('nom', RoleNom::Client)->firstOrFail();

        $clients = User::factory()->count(50)->create();
        foreach ($clients as $client) {
            $client->roles()->attach($clientRole->id);
        }

        $this->command?->info('50 clients créés.');
    }
}
