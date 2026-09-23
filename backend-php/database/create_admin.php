<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../src/Config/Env.php';
require_once __DIR__ . '/../src/Config/Database.php';
require_once __DIR__ . '/../src/Repositories/UserRepository.php';

Env::load(__DIR__ . '/../.env');

// Defaults let this be run with no arguments to seed the requested
// admin / admin123 account; pass explicit args to create a different user.
$username = $argv[1] ?? 'admin';
$password = $argv[2] ?? 'admin123';

if (trim($username) === '' || strlen($password) < 8) {
    fwrite(STDERR, "Username must not be empty and password must be at least 8 characters.\n");
    exit(1);
}

if (UserRepository::findByUsername($username) !== null) {
    fwrite(STDERR, "User '{$username}' already exists.\n");
    exit(1);
}

UserRepository::create($username, $password);
echo "Admin user '{$username}' created.\n";
