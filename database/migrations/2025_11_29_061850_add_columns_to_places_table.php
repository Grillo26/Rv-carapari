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
        Schema::table('places', function (Blueprint $table) {
            $table->string('title')->after('id');
            $table->string('slug')->unique()->after('title');
            $table->text('short_description')->after('slug');
            $table->longText('description')->after('short_description');
            $table->string('thumbnail')->nullable()->after('description');
            $table->string('main_360_image')->nullable()->after('thumbnail');
            $table->boolean('is_available')->default(true)->after('main_360_image');
            $table->integer('sort_order')->default(0)->after('is_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            $table->dropColumn([
                'title',
                'slug', 
                'short_description',
                'description',
                'thumbnail',
                'main_360_image',
                'is_available',
                'sort_order'
            ]);
        });
    }
};
