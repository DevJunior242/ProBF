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
        Schema::create('promos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('fournisseur_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('produit_id')->constrained('produits')->cascadeOnDelete();
            $table->decimal('prix_promo', 10, 2)->nullable();
            $table->string('texte')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};
