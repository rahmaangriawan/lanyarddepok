<?php

declare(strict_types=1);

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require dirname(__DIR__).'/vendor/autoload.php';

$app = require dirname(__DIR__).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$tables = ['category', 'post', 'page', 'media', 'setting', 'product', 'portfolio', 'citypage'];
$pdo = DB::connection()->getPdo();
$statements = [
    '-- Public CMS content generated from the local Lanyard Depok database.',
    'SET NAMES utf8mb4;',
    'SET FOREIGN_KEY_CHECKS = 0;',
];

foreach ($tables as $table) {
    if (! Schema::hasTable($table)) {
        continue;
    }

    foreach (DB::table($table)->orderBy('id')->get() as $row) {
        $values = get_object_vars($row);
        $columns = array_keys($values);
        $quotedColumns = implode(', ', array_map(fn (string $column) => '`'.$column.'`', $columns));
        $quotedValues = implode(', ', array_map(
            fn (mixed $value) => $value === null ? 'NULL' : $pdo->quote((string) $value),
            $values,
        ));
        $updates = implode(', ', array_map(
            fn (string $column) => '`'.$column.'` = VALUES(`'.$column.'`)',
            array_values(array_filter($columns, fn (string $column) => $column !== 'id')),
        ));

        $statements[] = "INSERT INTO `{$table}` ({$quotedColumns}) VALUES ({$quotedValues}) ON DUPLICATE KEY UPDATE {$updates};";
    }
}

$statements[] = 'SET FOREIGN_KEY_CHECKS = 1;';

$path = dirname(__DIR__).'/database/mysql-content.sql';
file_put_contents($path, implode(PHP_EOL, $statements).PHP_EOL);

echo "Wrote {$path}".PHP_EOL;
