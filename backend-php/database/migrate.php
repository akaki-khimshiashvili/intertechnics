<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../src/Config/Env.php';
require_once __DIR__ . '/../src/Config/Database.php';

Env::load(__DIR__ . '/../.env');

$sql = file_get_contents(__DIR__ . '/schema.sql');
if ($sql === false) {
    fwrite(STDERR, "Could not read schema.sql\n");
    exit(1);
}

// Strip whole-line comments before splitting, otherwise a leading comment would merge into
// (and blank out) the first real statement.
$sqlWithoutComments = preg_replace('/^\s*--.*$/m', '', $sql);

// Trusted, static schema file: safe to split on ';' and run one statement at a time
// instead of enabling PDO's multi-statement execution for this connection.
$statements = array_filter(array_map('trim', explode(';', $sqlWithoutComments)));

$pdo = Database::connection();
foreach ($statements as $statement) {
    if ($statement === '') {
        continue;
    }
    $pdo->exec($statement);
}

// CREATE TABLE IF NOT EXISTS leaves existing tables untouched, so columns
// added to schema.sql later are added here for databases created before them.
$addedColumns = [
    'machines' => [
        'vat_percent' => 'DECIMAL(5,2) NULL AFTER price_negotiable',
        'contact_phone' => 'VARCHAR(30) NULL AFTER vat_percent',
    ],
];
$columnExists = $pdo->prepare(
    'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column'
);
foreach ($addedColumns as $table => $columns) {
    foreach ($columns as $column => $definition) {
        $columnExists->execute(['table' => $table, 'column' => $column]);
        if ($columnExists->fetchColumn() === false) {
            $pdo->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
            echo "Added column {$table}.{$column}\n";
        }
    }
}

echo "Database schema applied successfully.\n";
