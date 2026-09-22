import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL, ApiError, deleteMachine, listMachines, type Machine } from '../../lib/api'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import '../ListPage.css'

const STATUS_LABELS: Record<Machine['status'], string> = {
  available: 'ხელმისაწვდომი',
  reserved: 'დაჯავშნილი',
  sold: 'გაყიდული',
}

function formatPrice(machine: Machine): string {
  if (machine.price === null) return machine.price_negotiable ? 'შეთანხმებით' : '—'
  const price = `${machine.price.toLocaleString('ka-GE')} ${machine.currency}`
  return machine.price_negotiable ? `${price} (შეთანხმებადი)` : price
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
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">ყველა სტატუსი</option>
            <option value="available">ხელმისაწვდომი</option>
            <option value="reserved">დაჯავშნილი</option>
            <option value="sold">გაყიდული</option>
          </select>
        </div>
      )}

      {!machines && !error && <p>იტვირთება...</p>}

      {filtered && (
        <div className="list-table-wrap">
          {filtered.length === 0 ? (
            <p className="list-empty">ტექნიკა ვერ მოიძებნა.</p>
          ) : (
            <table className="list-table">
              <thead>
                <tr>
                  <th></th>
                  <th>დასახელება</th>
                  <th>ბრენდი</th>
                  <th>კატეგორია</th>
                  <th>ფასი</th>
                  <th>სტატუსი</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((machine) => (
                  <tr key={machine.id}>
                    <td>
                      {machine.main_image ? (
                        <img className="list-cover-thumb" src={`${API_URL}${machine.main_image}`} alt="" />
                      ) : (
                        <span className="list-cover-placeholder" />
                      )}
                    </td>
                    <td>{machine.name}</td>
                    <td>{machine.brand ?? '—'}</td>
                    <td>{machine.category ?? '—'}</td>
                    <td>{formatPrice(machine)}</td>
                    <td>
                      <span className={`list-badge list-badge-${machine.status}`}>{STATUS_LABELS[machine.status]}</span>
                    </td>
                    <td>
                      <div className="list-actions">
                        <Link className="list-edit-link" to={`/machines/${machine.id}/edit`}>
                          რედაქტირება
                        </Link>
                        <button type="button" className="list-delete-btn" onClick={() => setPendingDelete(machine)}>
                          წაშლა
                        </button>
                      </div>
                    </td>
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
