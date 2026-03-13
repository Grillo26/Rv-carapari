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
        Schema::create('place_image_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_image_id')->constrained('place_images')->onDelete('cascade');
            $table->foreignId('target_image_id')->constrained('place_images')->onDelete('cascade');
            $table->float('pos_x');
            $table->float('pos_y');
            $table->float('pos_z');
            $table->string('label')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('place_image_routes');
    }
};
