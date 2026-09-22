import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import './AdminLayout.css'

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-brand">Intertechnics</div>
        <nav className="admin-nav">
          <NavLink to="/" end>
            მთავარი
          </NavLink>
          <NavLink to="/machines">ტექნიკა</NavLink>
          <NavLink to="/machines/new">დამატება</NavLink>
        </nav>
        <div className="admin-header-user">
          <p>მოგესალმებით, {user?.username}</p>
          <button type="button" onClick={logout}>
            გასვლა
          </button>
        </div>
      </header>
      <main className="admin-content">{children}</main>
    </div>
  )
}
