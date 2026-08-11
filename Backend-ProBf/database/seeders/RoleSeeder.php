<?php

namespace Database\Seeders;

use App\Enums\RoleNom;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (RoleNom::cases() as $role) {
            Role::firstOrCreate(['nom' => $role]);
        }
    }
}
