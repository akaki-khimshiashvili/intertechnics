<?php

declare(strict_types=1);

$router = new Router();

$router->get('/', static function (array $params): void {
    Response::json(['message' => 'Intertechnics API']);
});

$router->post('/auth/login', [AuthController::class, 'login']);
$router->get('/auth/me', [AuthController::class, 'me']);
$router->post('/auth/logout', [AuthController::class, 'logout']);
$router->post('/uploads/image', static function (array $params): void {
    AuthMiddleware::authenticate();
    UploadController::store($params);
});

// Public read endpoints
$router->get('/machines', [MachineController::class, 'index']);
$router->get('/machines/filters', [MachineController::class, 'filters']);
$router->get('/machines/{idOrSlug}', [MachineController::class, 'show']);

// Protected write endpoints
$router->post('/machines', static function (array $params): void {
    AuthMiddleware::authenticate();
    MachineController::store($params);
});
$router->put('/machines/{id}', static function (array $params): void {
    AuthMiddleware::authenticate();
    MachineController::update($params);
});
$router->delete('/machines/{id}', static function (array $params): void {
    AuthMiddleware::authenticate();
    MachineController::destroy($params);
});

// Analytics: anonymous event collection (public) and the dashboard summary (admin only)
$router->post('/analytics/events', [AnalyticsController::class, 'track']);
$router->get('/analytics/summary', static function (array $params): void {
    AuthMiddleware::authenticate();
    AnalyticsController::summary($params);
});

// Contact form: public, rate-limited, sends an email to the office
$router->post('/contact', [ContactController::class, 'send']);

return $router;
