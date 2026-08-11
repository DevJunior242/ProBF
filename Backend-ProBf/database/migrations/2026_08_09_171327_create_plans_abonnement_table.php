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
        Schema::create('plans_abonnement', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->tinyInteger('type');
            $table->string('nom');
            $table->unsignedInteger('duree_jours');
            $table->decimal('montant', 10, 2);
            $table->boolean('actif')->default(true);
            $table->unsignedInteger('ordre')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans_abonnement');
    }
};
