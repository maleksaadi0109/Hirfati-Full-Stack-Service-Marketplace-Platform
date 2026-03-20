<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'order_id')) {
                $table->unsignedBigInteger('order_id')->nullable()->after('id');
                $table->index('order_id');
            }

            if (!Schema::hasColumn('messages', 'content')) {
                $table->text('content')->nullable()->after('receiver_id');
            }
        });

        if (Schema::hasColumn('messages', 'message_text') && Schema::hasColumn('messages', 'content')) {
            DB::table('messages')
                ->whereNull('content')
                ->update([
                    'content' => DB::raw('message_text'),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'order_id')) {
                $table->dropIndex(['order_id']);
                $table->dropColumn('order_id');
            }

            if (Schema::hasColumn('messages', 'content')) {
                $table->dropColumn('content');
            }
        });
    }
};
