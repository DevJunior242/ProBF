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
        Schema::table('quartiers', function (Blueprint $table) {
            $table->foreignUuid('cree_par_id')->nullable()->after('ville_id')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quartiers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cree_par_id');
        });
    }
};
