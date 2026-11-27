'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser, logout as logoutRequest } from '../../services/auth'
import type { CurrentUser } from '../../types/auth'

const PUBLIC_PATHS = ['/', '/login', '/login/2fa', '/login/2fa-setup', '/invite/accept']

type AuthContextValue = {
  user: CurrentUser | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isPublic = PUBLIC_PATHS.includes(pathname)

  const [user, setUser] = useState<CurrentUser | null>(null)
  const [checked, setChecked] = useState(false)
  const [failedPath, setFailedPath] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (isPublic) {
      return
    }

    let cancelled = false

    getCurrentUser()
      .then(current => {
        if (cancelled) return

        if (current) {
          setFailedPath(null)
          setUser(current)
          setChecked(true)
        } else {
          setUser(null)
          setChecked(false)
          router.replace('/login')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setChecked(false)
          setFailedPath(pathname)
        }
      })

    return () => {
      cancelled = true
    }
  }, [attempt, isPublic, pathname, router])

  async function logout() {
    await logoutRequest()
    setUser(null)
    setChecked(false)
    router.replace('/login')
  }

  if (!isPublic && failedPath === pathname) {
    return (
      <main>
        <p role="alert">Could not verify your session. Try again in a moment.</p>
        <button type="button" onClick={() => {
          setFailedPath(null)
          setAttempt(value => value + 1)
        }}>Try again</button>
      </main>
    )
  }

  if (!isPublic && !checked) {
    return null
  }

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>
}
