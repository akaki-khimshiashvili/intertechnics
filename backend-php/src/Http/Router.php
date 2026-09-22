<?php

declare(strict_types=1);

require_once __DIR__ . '/../Exceptions/NotFoundException.php';

class Router
{
    private array $routes = [];

    public function get(string $path, mixed $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, mixed $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, mixed $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, mixed $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    private function add(string $method, string $path, mixed $handler): void
    {
        $this->routes[] = ['method' => $method, 'pattern' => $this->toRegex($path), 'handler' => $handler];
    }

    private function toRegex(string $path): string
    {
        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    public function dispatch(string $method, string $path): void
    {
        $path = rtrim($path, '/');
        if ($path === '') {
            $path = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            if (preg_match($route['pattern'], $path, $matches) === 1) {
                $params = array_filter($matches, static fn($key) => !is_int($key), ARRAY_FILTER_USE_KEY);
                call_user_func($route['handler'], $params);
                return;
            }
        }

        throw new NotFoundException('Route not found');
    }
}
