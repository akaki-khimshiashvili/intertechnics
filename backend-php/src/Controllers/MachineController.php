<?php

declare(strict_types=1);

require_once __DIR__ . '/../Http/Request.php';
require_once __DIR__ . '/../Http/Response.php';
require_once __DIR__ . '/../Exceptions/NotFoundException.php';
require_once __DIR__ . '/../Repositories/MachineRepository.php';
require_once __DIR__ . '/../Validation/MachineValidator.php';
require_once __DIR__ . '/../Support/Slugify.php';

class MachineController
{
    public static function index(array $params): void
    {
        $filters = [
            'q' => Request::query('q'),
            'brand' => Request::query('brand'),
            'category' => Request::query('category'),
            'condition_status' => Request::query('condition'),
            'status' => Request::query('status'),
            'sort' => Request::query('sort'),
        ];

        $featured = Request::query('featured');
        if ($featured === '1' || $featured === 'true') {
            $filters['featured'] = true;
        }

        $priceMin = Request::query('price_min');
        if ($priceMin !== null && is_numeric($priceMin)) {
            $filters['price_min'] = (float) $priceMin;
        }
        $priceMax = Request::query('price_max');
        if ($priceMax !== null && is_numeric($priceMax)) {
            $filters['price_max'] = (float) $priceMax;
        }

        $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT);
        if ($limit) {
            $filters['limit'] = $limit;
            $offset = filter_input(INPUT_GET, 'offset', FILTER_VALIDATE_INT);
            $filters['offset'] = $offset ?: 0;
        }

        $machines = MachineRepository::search($filters);
        $total = MachineRepository::count($filters);

        Response::json(['data' => $machines, 'total' => $total]);
    }

    public static function filters(array $params): void
    {
        Response::json([
            'brands' => MachineRepository::distinctBrands(),
            'categories' => MachineRepository::distinctCategories(),
            'price_range' => MachineRepository::priceRange(),
        ]);
    }

    public static function show(array $params): void
    {
        $idOrSlug = $params['idOrSlug'];
        $machine = ctype_digit($idOrSlug)
            ? MachineRepository::find((int) $idOrSlug)
            : MachineRepository::findBySlug($idOrSlug);

        if ($machine === null) {
            throw new NotFoundException('Machine not found');
        }
        Response::json($machine);
    }

    public static function store(array $params): void
    {
        $data = MachineValidator::forCreate(Request::jsonBody());
        $data['slug'] = self::uniqueSlug($data['slug'] ?? $data['name']);
        Response::json(MachineRepository::create($data), 201);
    }

    public static function update(array $params): void
    {
        $id = (int) $params['id'];
        if (MachineRepository::find($id) === null) {
            throw new NotFoundException('Machine not found');
        }
        $data = MachineValidator::forUpdate(Request::jsonBody());
        if (isset($data['slug'])) {
            $data['slug'] = self::uniqueSlug($data['slug'], $id);
        }
        Response::json(MachineRepository::update($id, $data));
    }

    public static function destroy(array $params): void
    {
        $id = (int) $params['id'];
        if (MachineRepository::find($id) === null) {
            throw new NotFoundException('Machine not found');
        }
        MachineRepository::delete($id);
        Response::json(null, 204);
    }

    private static function uniqueSlug(string $base, ?int $excludeId = null): string
    {
        $slug = Slugify::make($base);
        $candidate = $slug;
        $suffix = 2;
        while (MachineRepository::slugExists($candidate, $excludeId)) {
            $candidate = $slug . '-' . $suffix;
            $suffix++;
        }
        return $candidate;
    }
}
