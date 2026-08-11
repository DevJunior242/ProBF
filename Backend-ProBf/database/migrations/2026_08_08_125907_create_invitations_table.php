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
        Schema::create('invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('parrain_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('filleul_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('code')->unique();
            $table->tinyInteger('statut')->default(1);
            $table->boolean('recompense_appliquee')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
