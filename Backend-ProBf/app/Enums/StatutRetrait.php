<?php

namespace App\Enums;

enum StatutRetrait: int
{
    case EnAttente = 1;
    case Valide = 2;
    case Rejete = 3;
}
