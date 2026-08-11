<?php

namespace Database\Seeders;

use App\Enums\RoleNom;
use App\Models\Boost;
use App\Models\Role;
use Illuminate\Database\Seeder;

class DemoBoostsSeeder extends Seeder
{
    /**
     * Boost 15 pros existants au hasard, pour peupler la démo.
     */
    public function run(): void
    {
        $proRole = Role::where('nom', RoleNom::Pro)->firstOrFail();
        $pros = $proRole->users()->inRandomOrder()->limit(15)->get();

        foreach ($pros as $pro) {
            Boost::activerPour($pro, rand(1, 72));
        }

        $this->command?->info($pros->count() . ' pros boostés.');
    }
}
