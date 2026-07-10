<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportInitialContent extends Command
{
    protected $signature = 'content:import-initial {--force : Import even when posts already exist}';

    protected $description = 'Import the bundled public CMS content into an empty database.';

    public function handle(): int
    {
        $publishedPosts = DB::table('post')->where('published', true)->count();

        if (! $this->option('force') && $publishedPosts >= 6) {
            $this->line('Initial public content already exists; import skipped.');

            return self::SUCCESS;
        }

        $path = database_path('mysql-content.sql');

        if (! is_file($path)) {
            $this->warn('Bundled content dump is not available; import skipped.');

            return self::SUCCESS;
        }

        $sql = file_get_contents($path);

        if ($sql === false || trim($sql) === '') {
            $this->warn('Bundled content dump is empty; import skipped.');

            return self::SUCCESS;
        }

        DB::unprepared($sql);
        $this->info('Initial CMS content imported.');

        return self::SUCCESS;
    }
}
