<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvisController;
use App\Http\Controllers\Api\BoostController;
use App\Http\Controllers\Api\CategorieProduitController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\DevisExpressController;
use App\Http\Controllers\Api\FournisseurController;
use App\Http\Controllers\Api\FournisseurProfileController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\MetierController;
use App\Http\Controllers\Api\MoyenPaiementController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\Api\PlanAbonnementController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\ProController;
use App\Http\Controllers\Api\ProduitController;
use App\Http\Controllers\Api\PromoController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\QuartierController;
use App\Http\Controllers\Api\RetraitController;
use App\Http\Controllers\Api\TwoFactorAuthController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\WhatsappClickController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);

    // Étape 2 du login quand la 2FA est active (voir AuthController::login) :
    // l'utilisateur n'est pas encore authentifié, juste porteur du jeton
    // temporaire reçu à l'étape 1, donc route publique elle aussi.
    Route::middleware('throttle:2fa-challenge')->post('2fa/challenge', [TwoFactorAuthController::class, 'challenge']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('email/resend', [AuthController::class, 'resendVerification']);
        Route::post('roles', [AuthController::class, 'ajouterRole']);

        Route::post('2fa/enable', [TwoFactorAuthController::class, 'enable']);
        Route::post('2fa/confirm', [TwoFactorAuthController::class, 'confirm']);
        Route::post('2fa/disable', [TwoFactorAuthController::class, 'disable']);
        Route::post('2fa/recovery-codes/regenerate', [TwoFactorAuthController::class, 'regenerateRecoveryCodes']);
    });
});

// Public
Route::get('metiers', [MetierController::class, 'index']);
Route::get('quartiers', [QuartierController::class, 'index']);
Route::get('pros', [ProController::class, 'index']);
Route::get('pros/{id}', [ProController::class, 'show']);
Route::get('fournisseurs', [FournisseurController::class, 'index']);
Route::get('fournisseurs/{id}', [FournisseurController::class, 'show']);
Route::get('produits', [ProduitController::class, 'index']);
Route::get('categories-produit', [CategorieProduitController::class, 'index']);
Route::get('promos', [PromoController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('whatsapp-clicks', [WhatsappClickController::class, 'store']);
    Route::post('leads', [LeadController::class, 'store']);

    Route::get('verification', [VerificationController::class, 'show']);
    Route::post('verification', [VerificationController::class, 'store']);

    Route::post('metiers', [MetierController::class, 'store']);
    Route::post('quartiers', [QuartierController::class, 'store']);
    Route::post('demandes', [DemandeController::class, 'store']);
    Route::get('demandes', [DemandeController::class, 'index']);
    Route::put('demandes/{demande}', [DemandeController::class, 'update']);
    Route::delete('demandes/{demande}', [DemandeController::class, 'destroy']);
    Route::patch('demandes/{demande}/statut', [DemandeController::class, 'toggleStatut']);
    Route::post('avis', [AvisController::class, 'store']);
    Route::get('invitations', [InvitationController::class, 'index']);
    Route::post('invitations/generate', [InvitationController::class, 'generate']);
    Route::post('invitations/redeem', [InvitationController::class, 'redeem']);
    Route::get('invitations/solde', [InvitationController::class, 'solde']);
    Route::get('invitations/graphiques', [InvitationController::class, 'graphiques']);
    Route::post('retraits', [RetraitController::class, 'store']);
    Route::get('retraits/moi', [RetraitController::class, 'mesRetraits']);
    Route::post('paiements', [PaiementController::class, 'store']);
    Route::get('paiements/moi', [PaiementController::class, 'mesPaiements']);
    Route::post('boosts', [BoostController::class, 'store']);
    Route::post('devis-express', [DevisExpressController::class, 'store']);
    Route::get('moyens-paiement', [MoyenPaiementController::class, 'index']);
    Route::get('plans-abonnement', [PlanAbonnementController::class, 'index']);
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('dashboard/graphiques', [DashboardController::class, 'graphiques']);
    Route::post('upload', [UploadController::class, 'store']);

    Route::get('conversations', [ConversationController::class, 'index']);
    Route::post('conversations', [ConversationController::class, 'store']);
    Route::get('conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::get('messages/unread-count', [MessageController::class, 'unreadCount']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/lues', [NotificationController::class, 'marquerLues']);
    Route::delete('notifications', [NotificationController::class, 'destroy']);
    Route::middleware('throttle:message-send')->group(function () {
        Route::post('conversations/{conversation}/messages', [MessageController::class, 'store']);
    });

    Route::middleware('role:pro')->group(function () {
        Route::put('profile', [ProfileController::class, 'update']);
        Route::patch('profile/dispo', [ProfileController::class, 'updateDispo']);
        Route::post('portfolios', [PortfolioController::class, 'store']);
        Route::delete('portfolios/{portfolio}', [PortfolioController::class, 'destroy']);
        Route::patch('avis/{avis}/reponse', [AvisController::class, 'reponse']);
    });

    Route::middleware('role:fournisseur')->group(function () {
        Route::get('fournisseur-profile', [FournisseurProfileController::class, 'show']);
        Route::put('fournisseur-profile', [FournisseurProfileController::class, 'update']);
        Route::post('produits', [ProduitController::class, 'store']);
        Route::put('produits/{produit}', [ProduitController::class, 'update']);
        Route::delete('produits/{produit}', [ProduitController::class, 'destroy']);
        Route::post('promos', [PromoController::class, 'store']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('paiements', [PaiementController::class, 'index']);
        Route::patch('paiements/{paiement}/valider', [PaiementController::class, 'valider']);

        Route::post('moyens-paiement', [MoyenPaiementController::class, 'store']);
        Route::put('moyens-paiement/{moyenPaiement}', [MoyenPaiementController::class, 'update']);
        Route::delete('moyens-paiement/{moyenPaiement}', [MoyenPaiementController::class, 'destroy']);

        Route::post('plans-abonnement', [PlanAbonnementController::class, 'store']);
        Route::put('plans-abonnement/{planAbonnement}', [PlanAbonnementController::class, 'update']);
        Route::delete('plans-abonnement/{planAbonnement}', [PlanAbonnementController::class, 'destroy']);

        Route::get('retraits', [RetraitController::class, 'index']);
        Route::patch('retraits/{retrait}/valider', [RetraitController::class, 'valider']);

        Route::get('admin/quartiers', [QuartierController::class, 'adminIndex']);
        Route::delete('admin/quartiers/{quartier}', [QuartierController::class, 'destroy']);

        Route::get('admin/verifications', [AdminController::class, 'verifications']);
        Route::get('admin/verifications/{user}/document/{cote}', [AdminController::class, 'documentVerification']);
        Route::patch('admin/verifications/{user}/approuver', [AdminController::class, 'approuverVerification']);
        Route::patch('admin/verifications/{user}/rejeter', [AdminController::class, 'rejeterVerification']);

        Route::get('admin/dashboard', [AdminController::class, 'dashboard']);
        Route::get('admin/graphiques', [AdminController::class, 'graphiques']);
        Route::get('admin/rapport', [AdminController::class, 'rapport']);
        Route::get('admin/activite', [AdminController::class, 'activite']);
        Route::get('admin/abonnements', [AdminController::class, 'abonnements']);
        Route::get('admin/utilisateurs', [AdminController::class, 'utilisateurs']);
        Route::delete('admin/utilisateurs/{user}', [AdminController::class, 'supprimerUtilisateur']);
        Route::patch('admin/utilisateurs/{user}/masquer', [AdminController::class, 'toggleMasque']);
    });
});
