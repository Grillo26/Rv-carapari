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
        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('short_description');
            $table->longText('description');
            $table->string('thumbnail')->nullable();
            $table->string('main_360_image')->nullable();
            $table->boolean('is_available')->default(true);
            $table->integer('sort_order')->default(0);
            
            // Columnas adicionales que estaban en el segundo archivo
            $table->decimal('latitude', 10, 8)->nullable()->comment('Coordenada de latitud');
            $table->decimal('longitude', 11, 8)->nullable()->comment('Coordenada de longitud');
            $table->string('address')->nullable()->comment('Dirección del lugar');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
