<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Database.php';

/**
 * `specs` and `images` are JSON columns holding, respectively, an array of
 * {label, value} objects (free-form extra specs a fixed column doesn't cover
 * — e.g. "Throughput: 120 t/h" for an asphalt plant) and an array of gallery
 * image URLs beyond `main_image`.
 */
class MachineRepository
{
    public static function search(array $filters): array
    {
        [$sql, $params] = self::buildQuery('SELECT *', $filters, includeSort: true);

        $pdo = Database::connection();
        $stmt = $pdo->prepare($sql);
        foreach ($params as $key => $value) {
            if ($key === 'limit' || $key === 'offset') {
                $stmt->bindValue($key, $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue($key, $value);
            }
        }
        $stmt->execute();

        return array_map([self::class, 'mapRow'], $stmt->fetchAll());
    }

    public static function count(array $filters): int
    {
        [$sql, $params] = self::buildQuery('SELECT COUNT(*) AS total', $filters, includeSort: false, includePagination: false);

        $stmt = Database::connection()->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        return (int) $stmt->fetchColumn();
    }

    private static function buildQuery(
        string $select,
        array $filters,
        bool $includeSort,
        bool $includePagination = true
    ): array {
        $where = [];
        $params = [];

        if (!empty($filters['q'])) {
            $like = '%' . $filters['q'] . '%';
            $where[] = '(name LIKE :q1 OR name_en LIKE :q2 OR brand LIKE :q3 OR model LIKE :q4 OR category LIKE :q5 OR description LIKE :q6)';
            $params['q1'] = $like;
            $params['q2'] = $like;
            $params['q3'] = $like;
            $params['q4'] = $like;
            $params['q5'] = $like;
            $params['q6'] = $like;
        }
        if (!empty($filters['brand'])) {
            $where[] = 'brand = :brand';
            $params['brand'] = $filters['brand'];
        }
        if (!empty($filters['category'])) {
            $where[] = 'category = :category';
            $params['category'] = $filters['category'];
        }
        if (!empty($filters['condition_status'])) {
            $where[] = 'condition_status = :condition_status';
            $params['condition_status'] = $filters['condition_status'];
        }
        if (!empty($filters['featured'])) {
            $where[] = 'featured = 1';
        }
        if (array_key_exists('price_min', $filters) && $filters['price_min'] !== null) {
            $where[] = 'price >= :price_min';
            $params['price_min'] = $filters['price_min'];
        }
        if (array_key_exists('price_max', $filters) && $filters['price_max'] !== null) {
            $where[] = 'price <= :price_max';
            $params['price_max'] = $filters['price_max'];
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $where[] = 'status = :status';
            $params['status'] = $filters['status'];
        } elseif (empty($filters['status'])) {
            // Default public view: hide sold machines unless explicitly requested.
            $where[] = "status != 'sold'";
        }

        $sql = $select . ' FROM machines';
        if ($where !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        if ($includeSort) {
            $sql .= match ($filters['sort'] ?? '') {
                'price_asc' => ' ORDER BY (price IS NULL), price ASC, id DESC',
                'price_desc' => ' ORDER BY (price IS NULL), price DESC, id DESC',
                'oldest' => ' ORDER BY id ASC',
                default => ' ORDER BY featured DESC, id DESC',
            };
        }

        if ($includePagination && isset($filters['limit'])) {
            $sql .= ' LIMIT :limit OFFSET :offset';
            $params['limit'] = (int) $filters['limit'];
            $params['offset'] = (int) ($filters['offset'] ?? 0);
        }

        return [$sql, $params];
    }

    public static function find(int $id): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM machines WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row === false ? null : self::mapRow($row);
    }

    public static function findBySlug(string $slug): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM machines WHERE slug = :slug');
        $stmt->execute(['slug' => $slug]);
        $row = $stmt->fetch();
        return $row === false ? null : self::mapRow($row);
    }

    public static function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $sql = 'SELECT 1 FROM machines WHERE slug = :slug';
        $params = ['slug' => $slug];
        if ($excludeId !== null) {
            $sql .= ' AND id != :excludeId';
            $params['excludeId'] = $excludeId;
        }
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn() !== false;
    }

    public static function distinctBrands(): array
    {
        $stmt = Database::connection()->query(
            "SELECT DISTINCT brand FROM machines WHERE brand IS NOT NULL AND brand != '' ORDER BY brand"
        );
        return array_column($stmt->fetchAll(), 'brand');
    }

    public static function distinctCategories(): array
    {
        $stmt = Database::connection()->query(
            "SELECT DISTINCT category FROM machines WHERE category IS NOT NULL AND category != '' ORDER BY category"
        );
        return array_column($stmt->fetchAll(), 'category');
    }

    public static function priceRange(): array
    {
        $stmt = Database::connection()->query('SELECT MIN(price) AS min_price, MAX(price) AS max_price FROM machines WHERE price IS NOT NULL');
        $row = $stmt->fetch();
        return [
            'min' => $row['min_price'] !== null ? (float) $row['min_price'] : null,
            'max' => $row['max_price'] !== null ? (float) $row['max_price'] : null,
        ];
    }

    public static function create(array $data): array
    {
        $pdo = Database::connection();
        $data = self::encodeJsonFields(self::castBoolsForBind($data));

        $columns = array_keys($data);
        $placeholders = array_map(static fn($col) => ":{$col}", $columns);

        $sql = 'INSERT INTO machines (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $placeholders) . ')';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($data);

        return self::find((int) $pdo->lastInsertId());
    }

    public static function update(int $id, array $data): ?array
    {
        if ($data === []) {
            return self::find($id);
        }

        $data = self::encodeJsonFields(self::castBoolsForBind($data));

        $setClauses = [];
        foreach (array_keys($data) as $field) {
            $setClauses[] = "{$field} = :{$field}";
        }

        $sql = 'UPDATE machines SET ' . implode(', ', $setClauses) . ' WHERE id = :id';
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute([...$data, 'id' => $id]);

        return self::find($id);
    }

    public static function delete(int $id): void
    {
        $stmt = Database::connection()->prepare('DELETE FROM machines WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    /**
     * PDO_MYSQL with native prepares (EMULATE_PREPARES=false) binds PHP
     * `false` as an empty string rather than 0, which MySQL's strict mode
     * rejects for a TINYINT column ("Incorrect integer value: ''"). Casting
     * to int first avoids relying on PDO's implicit bool handling.
     */
    private static function castBoolsForBind(array $data): array
    {
        foreach (['price_negotiable', 'featured'] as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = (int) $data[$field];
            }
        }
        return $data;
    }

    private static function encodeJsonFields(array $data): array
    {
        if (array_key_exists('specs', $data)) {
            $data['specs'] = json_encode($data['specs'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        }
        if (array_key_exists('images', $data)) {
            $data['images'] = json_encode($data['images'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        }
        return $data;
    }

    private static function mapRow(array $row): array
    {
        $row['specs'] = json_decode($row['specs'] ?? '[]', true, 16, JSON_THROW_ON_ERROR);
        $row['images'] = json_decode($row['images'] ?? '[]', true, 16, JSON_THROW_ON_ERROR);
        $row['price_negotiable'] = (bool) $row['price_negotiable'];
        $row['featured'] = (bool) $row['featured'];
        $row['price'] = $row['price'] !== null ? (float) $row['price'] : null;
        $row['vat_percent'] = $row['vat_percent'] !== null ? (float) $row['vat_percent'] : null;
        $row['power_hp'] = $row['power_hp'] !== null ? (float) $row['power_hp'] : null;
        $row['operating_weight_kg'] = $row['operating_weight_kg'] !== null ? (float) $row['operating_weight_kg'] : null;
        $row['load_capacity_kg'] = $row['load_capacity_kg'] !== null ? (float) $row['load_capacity_kg'] : null;
        $row['lift_height_m'] = $row['lift_height_m'] !== null ? (float) $row['lift_height_m'] : null;
        $row['year'] = $row['year'] !== null ? (int) $row['year'] : null;
        $row['working_hours'] = $row['working_hours'] !== null ? (int) $row['working_hours'] : null;
        $row['id'] = (int) $row['id'];
        return $row;
    }
}
