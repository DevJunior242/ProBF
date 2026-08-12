<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('cnib_recto')->nullable()->after('cgu_accepted_at');
            $table->string('cnib_verso')->nullable()->after('cnib_recto');
            $table->tinyInteger('verification_statut')->default(1)->after('cnib_verso');
            $table->string('verification_rejet_raison')->nullable()->after('verification_statut');
            $table->foreignUuid('verifie_par_admin_id')->nullable()->after('verification_rejet_raison')->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable()->after('verifie_par_admin_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verifie_par_admin_id');
            $table->dropColumn(['cnib_recto', 'cnib_verso', 'verification_statut', 'verification_rejet_raison', 'verified_at']);
        });
    }
};
