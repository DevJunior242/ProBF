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
        Schema::create('retraits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ambassadeur_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('montant', 10, 2);
            $table->tinyInteger('statut')->default(1);
            $table->foreignUuid('valide_par_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retraits');
    }
};
