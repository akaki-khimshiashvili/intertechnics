<?php

declare(strict_types=1);

require_once __DIR__ . '/../Config/Database.php';

class AnalyticsRepository
{
    // Every metric the dashboard shows, as one SUM/COUNT per column so a
    // single scan over the date range produces all of them.
    private const METRICS_SQL = "
        SUM(event_type = 'page_view') AS page_views,
        COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN visitor_hash END) AS unique_visitors,
        SUM(event_type = 'page_view' AND path = '/machines') AS machines_page_views,
        SUM(event_type = 'page_view' AND machine_id IS NOT NULL) AS machine_detail_views,
        SUM(event_type = 'contact_click') AS contact_clicks,
        SUM(event_type = 'phone_click') AS phone_clicks
    ";

    public const METRICS = [
        'page_views',
        'unique_visitors',
        'machines_page_views',
        'machine_detail_views',
        'contact_clicks',
        'phone_clicks',
    ];

    public static function record(
        string $type,
        ?string $path,
        ?int $machineId,
        ?string $source,
        ?string $lang,
        ?string $visitorHash
    ): void {
        $stmt = Database::connection()->prepare(
            'INSERT INTO analytics_events (event_type, path, machine_id, source, lang, visitor_hash)
             VALUES (:type, :path, :machine_id, :source, :lang, :visitor_hash)'
        );
        $stmt->execute([
            'type' => $type,
            'path' => $path,
            'machine_id' => $machineId,
            'source' => $source,
            'lang' => $lang,
            'visitor_hash' => $visitorHash,
        ]);
    }

    /** Totals for [from, to). */
    public static function totals(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT ' . self::METRICS_SQL . ' FROM analytics_events WHERE created_at >= :from AND created_at < :to'
        );
        $stmt->execute(['from' => $from->format('Y-m-d H:i:s'), 'to' => $to->format('Y-m-d H:i:s')]);
        return self::intRow($stmt->fetch() ?: []);
    }

    /** One row per day in [from, to), zero-filled so the chart has no gaps. */
    public static function daily(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT DATE(created_at) AS day, ' . self::METRICS_SQL . '
             FROM analytics_events
             WHERE created_at >= :from AND created_at < :to
             GROUP BY day'
        );
        $stmt->execute(['from' => $from->format('Y-m-d H:i:s'), 'to' => $to->format('Y-m-d H:i:s')]);

        $byDay = [];
        foreach ($stmt->fetchAll() as $row) {
            $byDay[$row['day']] = self::intRow($row);
        }

        $days = [];
        for ($day = $from; $day < $to; $day = $day->modify('+1 day')) {
            $key = $day->format('Y-m-d');
            $days[] = ['day' => $key] + ($byDay[$key] ?? array_fill_keys(self::METRICS, 0));
        }
        return $days;
    }

    /** Most-viewed machines in [from, to), with names from the catalog (if still there). */
    public static function topMachines(\DateTimeImmutable $from, \DateTimeImmutable $to, int $limit = 10): array
    {
        $stmt = Database::connection()->prepare(
            "SELECT e.machine_id, m.name, m.slug,
                    COUNT(*) AS views,
                    COUNT(DISTINCT e.visitor_hash) AS visitors
             FROM analytics_events e
             LEFT JOIN machines m ON m.id = e.machine_id
             WHERE e.event_type = 'page_view' AND e.machine_id IS NOT NULL
               AND e.created_at >= :from AND e.created_at < :to
             GROUP BY e.machine_id, m.name, m.slug
             ORDER BY views DESC
             LIMIT :limit"
        );
        $stmt->bindValue('from', $from->format('Y-m-d H:i:s'));
        $stmt->bindValue('to', $to->format('Y-m-d H:i:s'));
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();

        return array_map(static fn (array $row): array => [
            'machine_id' => (int) $row['machine_id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'views' => (int) $row['views'],
            'visitors' => (int) $row['visitors'],
        ], $stmt->fetchAll());
    }

    private static function intRow(array $row): array
    {
        $out = [];
        foreach (self::METRICS as $metric) {
            $out[$metric] = (int) ($row[$metric] ?? 0);
        }
        return $out;
    }
}
