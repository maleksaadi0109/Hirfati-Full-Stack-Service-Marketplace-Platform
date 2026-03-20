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
          Schema::table('messages', function (Blueprint $table) {
        if (!Schema::hasColumn('messages', 'type')) {
            $table->string('type')->default('text')->after('receiver_id');
            // values you will use: text, image, audio
        }

        if (!Schema::hasColumn('messages', 'file_path')) {
            $table->string('file_path')->nullable()->after('content');
        }

        if (!Schema::hasColumn('messages', 'file_mime')) {
            $table->string('file_mime')->nullable()->after('file_path');
        }

        if (!Schema::hasColumn('messages', 'file_size')) {
            $table->unsignedBigInteger('file_size')->nullable()->after('file_mime');
        }

        if (!Schema::hasColumn('messages', 'audio_duration')) {
            $table->unsignedInteger('audio_duration')->nullable()->after('file_size');
            // in seconds
        }
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::table('messages', function (Blueprint $table) {
        $toDrop = [];

        foreach (['type', 'file_path', 'file_mime', 'file_size', 'audio_duration'] as $column) {
            if (Schema::hasColumn('messages', $column)) {
                $toDrop[] = $column;
            }
        }

        if (!empty($toDrop)) {
            $table->dropColumn($toDrop);
        }
    });
    }
};
