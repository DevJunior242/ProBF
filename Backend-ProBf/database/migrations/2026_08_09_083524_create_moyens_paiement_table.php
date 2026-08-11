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
        Schema::create('moyens_paiement', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nom');
            $table->string('numero');
            $table->string('nom_compte')->nullable();
            $table->text('instructions')->nullable();
            $table->string('logo')->nullable();
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
        Schema::dropIfExists('moyens_paiement');
    }
};
