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
        Schema::create('place_image_hotspots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('place_image_id')
                ->constrained('place_images')
                ->onDelete('cascade');
            $table->foreignId('asset_3d_id')
                ->constrained('assets_3d')
                ->onDelete('cascade');
            
            // Coordenadas 3D del hotspot (formato: 0.0 a 1.0 para normalizar)
            $table->float('pos_x')->comment('Posición X normalizada (0-1 o mayor)');
            $table->float('pos_y')->comment('Posición Y normalizada (0-1 o mayor)');
            $table->float('pos_z')->comment('Posición Z normalizada (0-1 o mayor)');
            
            // Metadatos
            $table->string('label')->nullable()->comment('Etiqueta o nombre del hotspot');
            $table->text('description')->nullable()->comment('Descripción del hotspot');
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Índices
            $table->index('place_image_id');
            $table->index('asset_3d_id');
            $table->index('is_active');
            $table->unique(['place_image_id', 'asset_3d_id'], 'unique_image_asset');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('place_image_hotspots');
    }
};
