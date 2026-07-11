<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('media')) {
            return;
        }

        DB::table('media')
            ->whereNull('filepath')
            ->orWhere('filepath', '')
            ->orWhereIn('url', ['/storage', '/storage/'])
            ->delete();
    }

    public function down(): void
    {
        // Invalid records had no usable file to restore.
    }
};
