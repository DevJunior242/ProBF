<?php

namespace Database\Seeders;

use App\Enums\RoleNom;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['telephone' => '+22670000000'],
            [
                'nom' => 'Admin ProBF',
                'email' => 'admin@probf.bf',
                'password' => 'password',
                'whatsapp_otp_verified_at' => now(),
                'email_verified_at' => now(),
                'cgu_accepted_at' => now(),
            ]
        );

        $adminRole = Role::where('nom', RoleNom::Admin)->firstOrFail();

        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
    }
}
