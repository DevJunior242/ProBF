<?php

namespace App\Enums;

enum StatutPaiement: int
{
    case EnAttente = 1;
    case Valide = 2;
    case Rejete = 3;
}
