import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMachines, type Machine } from '../lib/api'
import './Dashboard.css'

export function Dashboard() {
  const [machines, setMachines] = useState<Machine[] | null>(null)

  useEffect(() => {
    listMachines({ status: 'all' })
      .then(setMachines)
      .catch(() => setMachines([]))
  }, [])

  const total = machines?.length ?? null
  const available = machines?.filter((m) => m.status === 'available').length ?? null
  const featured = machines?.filter((m) => m.featured).length ?? null

  return (
    <div className="dashboard">
      <h1>მთავარი</h1>

      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <span className="dashboard-stat-value">{total ?? '—'}</span>
          <span className="dashboard-stat-label">სულ ტექნიკა</span>
        </div>
        <div className="dashboard-stat">
          <span className="dashboard-stat-value">{available ?? '—'}</span>
          <span className="dashboard-stat-label">ხელმისაწვდომი</span>
        </div>
        <div className="dashboard-stat">
          <span className="dashboard-stat-value">{featured ?? '—'}</span>
          <span className="dashboard-stat-label">გამორჩეული</span>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/machines" className="dashboard-card">
          <h2>ტექნიკის სია</h2>
          <p>ნახეთ, დაარედაქტირეთ ან წაშალეთ დამატებული ტექნიკა.</p>
        </Link>
        <Link to="/machines/new" className="dashboard-card dashboard-card-accent">
          <h2>ახალი ტექნიკის დამატება</h2>
          <p>დაამატეთ ახალი ერთეული სურათებით და მახასიათებლებით.</p>
        </Link>
      </div>
    </div>
  )
}
