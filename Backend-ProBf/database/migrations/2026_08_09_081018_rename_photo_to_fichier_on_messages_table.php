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
        Schema::table('messages', function (Blueprint $table) {
            $table->string('fichier_url')->nullable()->after('contenu');
            $table->string('fichier_nom')->nullable()->after('fichier_url');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('photo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('photo')->nullable();
            $table->dropColumn(['fichier_url', 'fichier_nom']);
        });
    }
};
