<?php

namespace Database\Seeders;

use App\Models\Quartier;
use App\Models\Ville;
use Illuminate\Database\Seeder;

class QuartierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $quartiersParVille = [
            'Ouagadougou' => [
                // Secteurs officiels les plus connus
                'Secteur 1', 'Secteur 4', 'Secteur 7', 'Secteur 10', 'Secteur 15',
                'Secteur 19', 'Secteur 22', 'Secteur 27', 'Secteur 30',
                // Quartiers / cités usuels
                'Pissy', 'Karpala', 'Ouaga 2000', 'Gounghin', 'Tanghin', 'Zogona',
                'Dassasgho', 'Cissin', 'Zone du Bois', 'Somgandé', 'Patte d\'Oie',
                'Kilwin', 'Larlé', 'Koulouba', 'Paspanga', 'Dapoya', 'Bilibambili',
                'Nioko', 'Tampouy', 'Wemtenga', 'Wayalguin', 'Kalgondin', 'Zangouettin',
                'Rimkiéta', 'Yagma', 'Saaba', 'Bogodogo', 'Nongr-Massom',
            ],
            'Bobo-Dioulasso' => [
                'Accart-Ville', 'Diarradougou', 'Sarfalao', 'Dogona', 'Colma',
                'Secteur 1', 'Secteur 5', 'Secteur 12', 'Secteur 18', 'Secteur 23',
                'Kua', 'Sikasso-Cira', 'Farakan', 'Belle-Ville', 'Dafra',
            ],
        ];

        foreach ($quartiersParVille as $villeNom => $quartiers) {
            $ville = Ville::where('nom', $villeNom)->firstOrFail();

            foreach ($quartiers as $nom) {
                Quartier::firstOrCreate(['ville_id' => $ville->id, 'nom' => $nom]);
            }
        }
    }
}
