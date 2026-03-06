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
        Schema::table('place_image_hotspots', function (Blueprint $table) {
            $table->dropUnique('unique_image_asset');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('place_image_hotspots', function (Blueprint $table) {
            $table->unique(['place_image_id', 'asset_3d_id'], 'unique_image_asset');
        });
    }
};
