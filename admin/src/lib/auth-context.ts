import { createContext } from 'react'

export type User = { id: number; username: string }

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
