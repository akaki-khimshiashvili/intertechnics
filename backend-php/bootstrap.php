<?php

declare(strict_types=1);

// Plain require_once includes in dependency order -- no Composer autoloader.

require_once __DIR__ . '/src/Support/MbstringPolyfill.php';
require_once __DIR__ . '/src/Support/Slugify.php';

require_once __DIR__ . '/src/Config/Env.php';
require_once __DIR__ . '/src/Config/Database.php';
require_once __DIR__ . '/src/Config/Jwt.php';

require_once __DIR__ . '/src/Exceptions/ApiException.php';
require_once __DIR__ . '/src/Exceptions/NotFoundException.php';
require_once __DIR__ . '/src/Exceptions/ValidationException.php';
require_once __DIR__ . '/src/Exceptions/ConflictException.php';
require_once __DIR__ . '/src/Exceptions/RateLimitException.php';

require_once __DIR__ . '/src/Repositories/MachineRepository.php';
require_once __DIR__ . '/src/Repositories/UserRepository.php';
require_once __DIR__ . '/src/Repositories/RateLimitRepository.php';
require_once __DIR__ . '/src/Repositories/RevokedTokenRepository.php';

require_once __DIR__ . '/src/Http/Request.php';
require_once __DIR__ . '/src/Http/Response.php';
require_once __DIR__ . '/src/Http/Router.php';
require_once __DIR__ . '/src/Http/ErrorHandler.php';
require_once __DIR__ . '/src/Http/RateLimiter.php';
require_once __DIR__ . '/src/Http/AuthMiddleware.php';

require_once __DIR__ . '/src/Validation/MachineValidator.php';

require_once __DIR__ . '/src/Controllers/AuthController.php';
require_once __DIR__ . '/src/Controllers/UploadController.php';
require_once __DIR__ . '/src/Controllers/MachineController.php';

Env::load(__DIR__ . '/.env');
