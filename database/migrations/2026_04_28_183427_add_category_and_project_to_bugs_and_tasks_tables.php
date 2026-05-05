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
        Schema::table('bugs', function (Blueprint $table) {
            $table->string('category')->nullable()->after('description');
            $table->string('project')->nullable()->after('category');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->string('category')->nullable()->after('description');
            $table->string('project')->nullable()->after('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bugs', function (Blueprint $table) {
            $table->dropColumn(['category', 'project']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['category', 'project']);
        });
    }
};
