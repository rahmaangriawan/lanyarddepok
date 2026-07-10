<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ImportInitialContent extends Command
{
    protected $signature = 'content:import-initial {--force : Import even when posts already exist}';

    protected $description = 'Import the bundled public CMS content into an empty database.';

    public function handle(): int
    {
        $publishedPosts = DB::table('post')->where('published', true)->count();
        $adminMarker = '.initial-admin-seeded';

        if ($this->option('force') || ! Storage::disk('local')->exists($adminMarker)) {
            $this->ensureInitialAdmin();
            Storage::disk('local')->put($adminMarker, now()->toIso8601String());
        }

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

    private function ensureInitialAdmin(): void
    {
        $email = (string) env('CMS_ADMIN_EMAIL', 'admin@tes.com');
        $password = (string) env('CMS_ADMIN_PASSWORD', 'admin12345');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => (string) env('CMS_ADMIN_NAME', 'Admin Tes'),
                'password' => Hash::make($password),
                'role' => 'ADMIN',
            ],
        );

        $this->line("Initial admin account is ready: {$email}");
    }
}
