'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser, logout as logoutRequest } from '../../services/auth'
import type { CurrentUser } from '../../types/auth'

const PUBLIC_PATHS = ['/', '/login', '/login/2fa', '/login/2fa-setup']

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

  useEffect(() => {
    if (isPublic) {
      return
    }

    let cancelled = false

    getCurrentUser()
      .then(current => {
        if (cancelled) return

        if (current) {
          setUser(current)
          setChecked(true)
        } else {
          router.replace('/login')
        }
      })
      .catch(() => {
        if (!cancelled) router.replace('/login')
      })

    return () => {
      cancelled = true
    }
  }, [isPublic, pathname, router])

  async function logout() {
    await logoutRequest()
    setUser(null)
    setChecked(false)
    router.replace('/login')
  }

  if (!isPublic && !checked) {
    return null
  }

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>
}
