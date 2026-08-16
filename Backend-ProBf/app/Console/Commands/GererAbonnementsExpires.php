<?php

namespace App\Console\Commands;

use App\Enums\RoleNom;
use App\Enums\StatutAbonnement;
use App\Enums\StatutPaiement;
use App\Enums\TypeAbonnement;
use App\Models\Paiement;
use App\Models\User;
use App\Notifications\AbonnementARenouvelerNotification;
use Illuminate\Console\Command;

class GererAbonnementsExpires extends Command
{
    protected $signature = 'probf:gerer-abonnements-expires';

    protected $description = "Masque les profils Pro dont l'abonnement est expiré depuis plus de 3 jours (sans paiement en attente), et notifie les pros/fournisseurs proches de l'expiration ou déjà masqués.";

    public function handle(): int
    {
        $this->traiterRole(RoleNom::Pro, TypeAbonnement::Pro);
        $this->traiterRole(RoleNom::Fournisseur, TypeAbonnement::Fournisseur);

        return self::SUCCESS;
    }

    private function traiterRole(RoleNom $role, TypeAbonnement $type): void
    {
        $users = User::whereHas('roles', fn ($q) => $q->where('nom', $role))
            ->with(['profile', 'abonnements' => fn ($q) => $q->where('type', $type)->latest('date_fin')])
            ->get();

        foreach ($users as $user) {
            $abonnement = $user->abonnements->first();

            if (! $abonnement) {
                continue;
            }

            $joursRestants = (int) now()->startOfDay()->diffInDays($abonnement->date_fin, false);
            $expireDepuisPlus3Jours = $abonnement->statut !== StatutAbonnement::Actif
                || $abonnement->date_fin->lt(now()->subDays(3));

            // Un masquage automatique en attendant un paiement déjà envoyé par
            // le pro serait injuste tant qu'un admin ne l'a pas encore validé.
            $paiementEnAttente = Paiement::where('user_id', $user->id)
                ->where('contexte', 'abonnement')
                ->where('statut', StatutPaiement::EnAttente)
                ->exists();

            // Le masquage automatique n'existe aujourd'hui que pour le rôle
            // Pro : Profile::masque est le seul champ lu par ProController.
            if ($role === RoleNom::Pro && $expireDepuisPlus3Jours && ! $paiementEnAttente && $user->profile && ! $user->profile->masque) {
                $user->profile->update(['masque' => true, 'masque_motif' => 'expiration']);
                $user->notify(new AbonnementARenouvelerNotification($abonnement, true, 0));

                continue;
            }

            $dejaMasque = $role === RoleNom::Pro && $user->profile?->masque;

            if (! $dejaMasque && $joursRestants >= 0 && $joursRestants <= 7 && ! $this->rappelDejaEnvoye($user, $abonnement->id)) {
                $user->notify(new AbonnementARenouvelerNotification($abonnement, false, $joursRestants));
            }
        }
    }

    private function rappelDejaEnvoye(User $user, string $abonnementId): bool
    {
        return $user->notifications()
            ->where('type', AbonnementARenouvelerNotification::class)
            ->where('data->abonnement_id', $abonnementId)
            ->where('created_at', '>=', now()->subDays(7))
            ->exists();
    }
}
