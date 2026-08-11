<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

trait GenereSeriePeriodique
{
    /**
     * Complète une série groupée par période avec des zéros pour les périodes
     * sans données, afin d'obtenir une courbe continue plutôt qu'un seul point.
     */
    private function remplirPeriodes(Collection $lignes, string $format, Carbon $depuis, string $pas): Collection
    {
        $phpFormat = str_replace('%', '', $format);
        $valeurs = $lignes->pluck('total', 'periode');

        $cles = collect();
        for ($curseur = $depuis->copy(); $curseur->lte(now()); $curseur->{$pas}()) {
            $cles->push($curseur->format($phpFormat));
        }

        return $cles->map(fn ($cle) => [
            'periode' => $cle,
            'total' => $valeurs[$cle] ?? 0,
        ]);
    }
}
