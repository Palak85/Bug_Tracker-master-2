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
            $table->index('status');
            $table->index('priority');
            $table->index('severity');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->index('status');
            $table->index('priority');
            $table->index('severity');
        });

        Schema::table('activities', function (Blueprint $table) {
            $table->index(['type', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bugs', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['priority']);
            $table->dropIndex(['severity']);
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['priority']);
            $table->dropIndex(['severity']);
        });

        Schema::table('activities', function (Blueprint $table) {
            $table->dropIndex(['type', 'subject_id']);
        });
    }
};
