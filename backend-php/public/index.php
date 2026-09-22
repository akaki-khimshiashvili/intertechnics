<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);
ErrorHandler::register();

// CORS: only echo back an explicitly allow-listed origin, never a wildcard.
$allowedOrigins = array_filter(array_map('trim', explode(',', Env::get('CORS_ALLOWED_ORIGINS', '') ?? '')));
$origin = $_SERVER['HTTP_ORIGIN'] ?? null;
if ($origin !== null && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

if (Request::method() === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/** @var Router $router */
$router = require __DIR__ . '/../routes.php';
$router->dispatch(Request::method(), Request::path());
