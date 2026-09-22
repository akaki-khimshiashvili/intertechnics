import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import { ApiError } from '../lib/api'
import './Login.css'

export function Login() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'დაფიქსირდა შეცდომა, სცადეთ თავიდან')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="login-brand">Intertechnics</span>
        <h1>ადმინისტრაციული პანელი</h1>

        <label className="login-field">
          <span>მომხმარებლის სახელი</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            name="username"
            required
          />
        </label>

        <label className="login-field">
          <span>პაროლი</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            name="password"
            required
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'იტვირთება...' : 'შესვლა'}
        </button>
      </form>
    </main>
  )
}
