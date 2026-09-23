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

echo "Database schema applied successfully.\n";
