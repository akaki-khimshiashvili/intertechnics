import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL, ApiError, deleteMachine, listMachines, type Machine } from '../../lib/api'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Select } from '../../components/Select'
import '../ListPage.css'

const STATUS_LABELS: Record<Machine['status'], string> = {
  available: 'ხელმისაწვდომი',
  reserved: 'დაჯავშნილი',
  sold: 'გაყიდული',
}

function formatPrice(machine: Machine): string {
  if (machine.price === null) return machine.price_negotiable ? 'შეთანხმებით' : '—'
  const vat = machine.vat_percent !== null ? ` + ${machine.vat_percent}% დღგ` : ''
  const price = `${machine.price.toLocaleString('ka-GE')} ${machine.currency}${vat}`
  return machine.price_negotiable ? `${price} (შეთანხმებადი)` : price
}

function formatDate(value: string): string {
  const [date] = value.split(' ')
  const [y, m, d] = date.split('-')
  return d && m && y ? `${d}.${m}.${y}` : value
}

export function MachinesList() {
  const [machines, setMachines] = useState<Machine[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Machine | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    listMachines({ status: 'all' })
      .then(setMachines)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'ტექნიკის ჩატვირთვა ვერ მოხერხდა'))
  }, [])

  const filtered = useMemo(() => {
    if (!machines) return null
    const term = search.trim().toLowerCase()
    return machines.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false
      if (!term) return true
      return (
        m.name.toLowerCase().includes(term) ||
        (m.brand ?? '').toLowerCase().includes(term) ||
        (m.category ?? '').toLowerCase().includes(term) ||
        (m.model ?? '').toLowerCase().includes(term)
      )
    })
  }, [machines, search, statusFilter])

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      await deleteMachine(pendingDelete.id)
      setMachines((prev) => (prev ? prev.filter((m) => m.id !== pendingDelete.id) : prev))
      setPendingDelete(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ტექნიკის წაშლა ვერ მოხერხდა')
      setPendingDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>დამატებული ტექნიკა</h1>
        <Link to="/machines/new" className="list-add-link">
          + ახალი ტექნიკა
        </Link>
      </div>

      {error && <p className="list-error">{error}</p>}

      {machines && (
        <div className="list-toolbar">
          <input
            type="search"
            placeholder="ძებნა სახელით, ბრენდით, მოდელით..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            ariaLabel="სტატუსი"
            options={[
              { value: 'all', label: 'ყველა სტატუსი' },
              { value: 'available', label: 'ხელმისაწვდომი' },
              { value: 'reserved', label: 'დაჯავშნილი' },
              { value: 'sold', label: 'გაყიდული' },
            ]}
          />
        </div>
      )}

      {!machines && !error && <p>იტვირთება...</p>}

      {filtered && (
        <div className={`list-table-wrap${filtered.length > 0 ? ' is-scrollable' : ''}`}>
          {filtered.length === 0 ? (
            <p className="list-empty">ტექნიკა ვერ მოიძებნა.</p>
          ) : (
            <table className="list-table">
              <thead>
                <tr>
                  <th className="list-col-machine">ტექნიკა</th>
                  <th>ბრენდი</th>
                  <th>კატეგორია</th>
                  <th>მოდელი</th>
                  <th>წელი</th>
                  <th>მდგომარეობა</th>
                  <th>ფასი</th>
                  <th>სტატუსი</th>
                  <th>გამორჩეული</th>
                  <th>სიმძლავრე</th>
                  <th>წონა</th>
                  <th>ნამუშევარი საათები</th>
                  <th>განახლდა</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((machine) => (
                  <tr key={machine.id}>
                    {/* First column: photo, name, and the row's actions right beside the name. */}
                    <td className="list-col-machine">
                      <div className="list-machine">
                        {machine.main_image ? (
                          <img className="list-cover-thumb" src={`${API_URL}${machine.main_image}`} alt="" loading="lazy" />
                        ) : (
                          <span className="list-cover-placeholder" />
                        )}
                        <div className="list-machine-text">
                          <div className="list-machine-title">
                            <Link className="list-machine-name" to={`/machines/${machine.id}/edit`} title={machine.name}>
                              {machine.name}
                            </Link>
                            <div className="list-actions">
                              <Link
                                className="list-action list-action-edit"
                                to={`/machines/${machine.id}/edit`}
                                aria-label={`„${machine.name}" რედაქტირება`}
                                title="რედაქტირება"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                                <span>რედაქტირება</span>
                              </Link>
                              <button
                                type="button"
                                className="list-action list-action-delete"
                                onClick={() => setPendingDelete(machine)}
                                aria-label={`„${machine.name}" წაშლა`}
                                title="წაშლა"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                </svg>
                                <span>წაშლა</span>
                              </button>
                            </div>
                          </div>
                          {machine.name_en && <span className="list-machine-sub">{machine.name_en}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{machine.brand ?? '—'}</td>
                    <td>{machine.category ?? '—'}</td>
                    <td>{machine.model ?? '—'}</td>
                    <td>{machine.year ?? '—'}</td>
                    <td>{machine.condition_status === 'new' ? 'ახალი' : 'მეორადი'}</td>
                    <td>{formatPrice(machine)}</td>
                    <td>
                      <span className={`list-badge list-badge-${machine.status}`}>{STATUS_LABELS[machine.status]}</span>
                    </td>
                    <td>{machine.featured ? '★ კი' : '—'}</td>
                    <td>{machine.power_hp !== null ? `${machine.power_hp} hp` : '—'}</td>
                    <td>{machine.operating_weight_kg !== null ? `${machine.operating_weight_kg.toLocaleString('en-US')} kg` : '—'}</td>
                    <td>{machine.working_hours !== null ? `${machine.working_hours.toLocaleString('en-US')} სთ` : '—'}</td>
                    <td>{formatDate(machine.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        message={`გსურთ „${pendingDelete?.name}" წაშლა? ეს მოქმედება შეუქცევადია.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setPendingDelete(null)}
      />
    </div>
  )
}
