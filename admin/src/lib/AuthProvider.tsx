import { useEffect, useState, type ReactNode } from 'react'
import { fetchCurrentUser, login as loginRequest, logout as logoutRequest, ApiError, TOKEN_KEY } from './api'
import { decodeJwtPayload } from './jwt'
import { AuthContext, type User } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    // Optimistic: trust a stored token immediately, decoded locally.
    const claims = decodeJwtPayload(token)
    if (claims) {
      setUser(claims)
      setIsLoading(false)
    }

    // Verify against the server in the background.
    fetchCurrentUser(token)
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError) {
          localStorage.removeItem(TOKEN_KEY)
          setUser(null)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(username: string, password: string) {
    const token = await loginRequest(username, password)
    const claims = decodeJwtPayload(token)
    if (!claims) {
      throw new ApiError(500, 'დაფიქსირდა შეცდომა, სცადეთ თავიდან')
    }
    localStorage.setItem(TOKEN_KEY, token)
    setUser(claims)
  }

  async function logout() {
    const token = localStorage.getItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    if (token) {
      await logoutRequest(token)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}
