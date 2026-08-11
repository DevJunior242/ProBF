<?php

namespace App\Enums;

enum RoleNom: string
{
    case Client = 'client';
    case Pro = 'pro';
    case Fournisseur = 'fournisseur';
    case Admin = 'admin';
}
