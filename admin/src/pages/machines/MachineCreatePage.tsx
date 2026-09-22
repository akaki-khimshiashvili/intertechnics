import { Link } from 'react-router-dom'
import { MachineForm } from './MachineForm'
import '../ListPage.css'

export function MachineCreatePage() {
  return (
    <div className="list-page">
      <Link to="/machines" className="list-back-link">
        ← ტექნიკის სია
      </Link>
      <h1>ახალი ტექნიკის დამატება</h1>
      <MachineForm />
    </div>
  )
}
