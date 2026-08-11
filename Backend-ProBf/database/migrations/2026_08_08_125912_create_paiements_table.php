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
        Schema::create('paiements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('abonnement_id')->nullable()->constrained()->nullOnDelete();
            $table->tinyInteger('type');
            $table->decimal('montant', 10, 2);
            $table->string('reference_transaction')->nullable();
            $table->string('preuve')->nullable();
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
        Schema::dropIfExists('paiements');
    }
};
