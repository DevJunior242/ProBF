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
        Schema::create('leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('fournisseur_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('produit_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('client_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('cout', 8, 2)->default(200);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
