<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            // Distingue un masquage manuel (décision admin, ex: signalement)
            // d'un masquage automatique pour non-renouvellement, pour que le
            // renouvellement ne démasque jamais un profil masqué par un admin.
            $table->string('masque_motif')->nullable()->after('masque');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('masque_motif');
        });
    }
};
