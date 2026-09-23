import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnalyticsSummary, type AnalyticsMetric, type AnalyticsSummary } from '../lib/api'
import './AnalyticsPanel.css'

const RANGES = [7, 30, 90] as const

const METRICS: { key: AnalyticsMetric; label: string; hint: string }[] = [
  { key: 'page_views', label: 'ვიზიტები', hint: 'გვერდების ყველა ნახვა' },
  { key: 'unique_visitors', label: 'უნიკალური ვიზიტორები', hint: 'სხვადასხვა ადამიანი დღეში' },
  { key: 'machines_page_views', label: 'კატალოგის ნახვები', hint: 'ტექნიკის სიის გვერდი' },
  { key: 'machine_detail_views', label: 'ტექნიკის დეტალების ნახვები', hint: 'ცალკეული ტექნიკის გვერდი' },
  { key: 'contact_clicks', label: '„კონტაქტზე“ დაჭერა', hint: 'მენიუ და ფუტერი' },
  { key: 'phone_clicks', label: 'ტელეფონზე დაჭერა', hint: 'ნომერზე დარეკვის ღილაკები' },
]

const numberFormat = new Intl.NumberFormat('en-US')

// Browsers don't reliably ship Georgian month names for toLocaleDateString
// (Chrome falls back to English), so format "23 სექ" by hand.
const MONTHS_KA = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ']

function formatDay(day: string, withYear = false): string {
  const [year, month, date] = day.split('-').map(Number)
  return `${date} ${MONTHS_KA[month - 1]}${withYear ? ` ${year}` : ''}`
}

function change(current: number, previous: number): { text: string; direction: 'up' | 'down' | 'flat' } {
  if (previous === 0) return current > 0 ? { text: 'ახალი', direction: 'up' } : { text: '—', direction: 'flat' }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return { text: '0%', direction: 'flat' }
  return { text: `${Math.abs(pct)}%`, direction: pct > 0 ? 'up' : 'down' }
}

export function AnalyticsPanel() {
  const [days, setDays] = useState<number>(30)
  const [metric, setMetric] = useState<AnalyticsMetric>('page_views')
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAnalyticsSummary(days)
      .then((data) => !cancelled && setSummary(data))
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [days])

  const active = METRICS.find((m) => m.key === metric)!
  const loading = !summary || summary.days !== days

  return (
    <section className="analytics" aria-labelledby="analytics-title">
      <div className="analytics-header">
        <h2 id="analytics-title">საიტის სტატისტიკა</h2>
        <div className="analytics-range" role="group" aria-label="პერიოდი">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={days === r}
              onClick={() => {
                setError(null)
                setDays(r)
              }}
            >
              {r} დღე
            </button>
          ))}
        </div>
      </div>

      {error && <p className="analytics-error">{error}</p>}

      <div className={`analytics-kpis${loading ? ' is-loading' : ''}`}>
        {METRICS.map((m) => {
          const value = summary?.totals[m.key] ?? 0
          const delta = summary ? change(value, summary.previous_totals[m.key]) : null
          return (
            <button
              key={m.key}
              type="button"
              className="analytics-kpi"
              aria-pressed={metric === m.key}
              onClick={() => setMetric(m.key)}
              title="გრაფიკზე ჩვენება"
            >
              <span className="analytics-kpi-label">{m.label}</span>
              <span className="analytics-kpi-value">{summary ? numberFormat.format(value) : '—'}</span>
              <span className="analytics-kpi-meta">
                {delta && (
                  <span className={`analytics-delta analytics-delta--${delta.direction}`}>
                    {delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : ''} {delta.text}
                  </span>
                )}
                <span>{m.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3>{active.label}</h3>
            <p>დღეების მიხედვით · ბოლო {days} დღე · წინა პერიოდთან შედარება ზემოთ</p>
          </div>
          <button type="button" className="analytics-link-button" onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'გრაფიკის ნახვა' : 'ცხრილის ნახვა'}
          </button>
        </div>

        {summary &&
          (showTable ? (
            <DailyTable daily={summary.daily} metric={metric} label={active.label} />
          ) : (
            <DailyChart daily={summary.daily} metric={metric} label={active.label} />
          ))}
      </div>

      <div className="analytics-card">
        <div className="analytics-card-header">
          <div>
            <h3>ყველაზე ნანახი ტექნიკა</h3>
            <p>ბოლო {days} დღე</p>
          </div>
        </div>
        {summary && <TopMachines rows={summary.top_machines} />}
      </div>

      <p className="analytics-note">
        სტატისტიკა ანონიმურია: ქუქი-ფაილები და IP მისამართები არ ინახება, ბოტები არ ითვლება. უნიკალური ვიზიტორი
        ითვლება დღეში ერთხელ — ერთი და იგივე ადამიანი სხვადასხვა დღეს ცალ-ცალკე ჩაითვლება.
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Daily column chart (single series: title names it, so no legend box)
// ---------------------------------------------------------------------------

const CHART_HEIGHT = 220
const PAD = { top: 12, right: 8, bottom: 26, left: 40 }
const BAR_MAX = 24
const BAR_GAP = 2

function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 1]
  const rawStep = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = Math.max(1, [1, 2, 5, 10].map((f) => f * magnitude).find((s) => s >= rawStep) ?? magnitude * 10)
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  return ticks
}

function barPath(x: number, y: number, w: number, base: number): string {
  const h = base - y
  const r = Math.min(4, w / 2, h)
  // 4px rounded data-end, square at the baseline.
  return `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${base}Z`
}

function DailyChart({ daily, metric, label }: { daily: AnalyticsSummary['daily']; metric: AnalyticsMetric; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [hover, setHover] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const values = daily.map((d) => d[metric])
  const ticks = niceTicks(Math.max(...values, 0))
  const top = ticks[ticks.length - 1]
  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom
  const base = PAD.top + plotH
  const slot = daily.length ? plotW / daily.length : 0
  const barW = Math.max(1, Math.min(BAR_MAX, slot - BAR_GAP))
  const y = (v: number) => base - (v / top) * plotH
  const labelEvery = Math.max(1, Math.ceil(daily.length / 6))
  const total = values.reduce((a, b) => a + b, 0)

  return (
    <div className="analytics-chart" ref={wrapRef} onPointerLeave={() => setHover(null)}>
      {width > 0 && (
        <svg
          width={width}
          height={CHART_HEIGHT}
          role="img"
          aria-label={`${label}: სულ ${numberFormat.format(total)}, ${daily.length} დღე`}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line className="analytics-grid" x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} />
              <text className="analytics-axis" x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end">
                {numberFormat.format(t)}
              </text>
            </g>
          ))}

          {daily.map((d, i) => {
            const v = d[metric]
            const x = PAD.left + i * slot + (slot - barW) / 2
            return (
              <g key={d.day}>
                {v > 0 && (
                  <path className={`analytics-bar${hover === i ? ' is-active' : ''}`} d={barPath(x, y(v), barW, base)} />
                )}
                {i % labelEvery === 0 && (
                  <text className="analytics-axis" x={PAD.left + i * slot + slot / 2} y={CHART_HEIGHT - 6} textAnchor="middle">
                    {formatDay(d.day)}
                  </text>
                )}
                {/* Hit target: the whole column slot, not just the bar. */}
                <rect
                  className="analytics-hit"
                  x={PAD.left + i * slot}
                  y={PAD.top}
                  width={slot}
                  height={plotH}
                  onPointerEnter={() => setHover(i)}
                />
              </g>
            )
          })}
        </svg>
      )}

      {hover !== null && daily[hover] && (
        <div
          // Centered over the bar, but pinned to the chart's edge near either
          // end so it never runs outside the card.
          className={`analytics-tooltip analytics-tooltip--${
            hover / daily.length > 0.75 ? 'end' : hover / daily.length < 0.25 ? 'start' : 'center'
          }`}
          style={{
            left: PAD.left + hover * slot + slot / 2,
            top: Math.max(y(daily[hover][metric]) - 8, 8),
          }}
          role="status"
        >
          <span className="analytics-tooltip-day">{formatDay(daily[hover].day, true)}</span>
          <span className="analytics-tooltip-value">
            <i aria-hidden="true" /> {label}: <strong>{numberFormat.format(daily[hover][metric])}</strong>
          </span>
        </div>
      )}
    </div>
  )
}

function DailyTable({ daily, metric, label }: { daily: AnalyticsSummary['daily']; metric: AnalyticsMetric; label: string }) {
  return (
    <div className="analytics-table-wrap">
      <table className="analytics-table">
        <thead>
          <tr>
            <th scope="col">თარიღი</th>
            <th scope="col">{label}</th>
          </tr>
        </thead>
        <tbody>
          {[...daily].reverse().map((d) => (
            <tr key={d.day}>
              <td>{formatDay(d.day, true)}</td>
              <td>{numberFormat.format(d[metric])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TopMachines({ rows }: { rows: AnalyticsSummary['top_machines'] }) {
  if (rows.length === 0) return <p className="analytics-empty">ამ პერიოდში ტექნიკის გვერდები ჯერ არ უნახავთ.</p>
  const max = Math.max(...rows.map((r) => r.views))

  return (
    <table className="analytics-table analytics-top">
      <thead>
        <tr>
          <th scope="col">ტექნიკა</th>
          <th scope="col">ნახვები</th>
          <th scope="col">ვიზიტორები</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.machine_id}>
            <td>
              {r.name ? (
                <Link to={`/machines/${r.machine_id}/edit`} className="analytics-top-name" title={r.name}>
                  {r.name}
                </Link>
              ) : (
                <span className="analytics-top-name is-deleted">წაშლილი ტექნიკა #{r.machine_id}</span>
              )}
              <span className="analytics-top-bar" aria-hidden="true">
                <span style={{ width: `${(r.views / max) * 100}%` }} />
              </span>
            </td>
            <td>{numberFormat.format(r.views)}</td>
            <td>{numberFormat.format(r.visitors)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
