<?php

namespace App\Enums;

enum VerificationStatut: int
{
    case NonSoumis = 1;
    case EnAttente = 2;
    case Verifie = 3;
    case Rejete = 4;
}
