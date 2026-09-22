import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getMachine, type Machine } from '../../lib/api'
import { MachineForm } from './MachineForm'
import '../ListPage.css'

export function MachineEditPage() {
  const { id } = useParams()
  const [machine, setMachine] = useState<Machine | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getMachine(Number(id))
      .then(setMachine)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'ტექნიკის ჩატვირთვა ვერ მოხერხდა'))
  }, [id])

  return (
    <div className="list-page">
      <Link to="/machines" className="list-back-link">
        ← ტექნიკის სია
      </Link>
      <h1>ტექნიკის რედაქტირება</h1>

      {error && <p className="list-error">{error}</p>}
      {!error && !machine && <p>იტვირთება...</p>}
      {machine && <MachineForm key={machine.id} machine={machine} />}
    </div>
  )
}
