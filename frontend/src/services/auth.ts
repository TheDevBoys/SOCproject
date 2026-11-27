import type { CurrentUser, LoginRequest, LoginResponse, MfaSetup } from '../types/auth'

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (response.ok || response.status === 401) {
    return response.json()
  }

  if (response.status === 400) {
    return { success: false, requiresMfa: false, message: 'Enter a valid email address and password.' }
  }

  throw new Error(`Login failed: ${response.status} ${response.statusText}`)
}

export async function getMfaSetup(): Promise<MfaSetup | null> {
  const response = await fetch('/api/auth/mfa/setup', {
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(`MFA setup failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function verifyMfa(code: string): Promise<boolean> {
  const response = await fetch('/api/auth/mfa/verify', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })

  if (response.ok) {
    return true
  }

  if (response.status === 401 || response.status === 400) {
    return false
  }

  throw new Error(`MFA verification failed: ${response.status} ${response.statusText}`)
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Could not load user: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { 
    method: 'POST',
    credentials: 'include'
  })
}
