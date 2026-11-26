import type { User } from '../types/user'

export async function getUsers(): Promise<User[]> {
  const response = await fetch('/api/users', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
async function changeUser(id: string, method: 'PUT' | 'DELETE', profile?: { name: string; email: string }) {
  const response = await fetch(`/api/users/${id}`, {
    method,
    credentials: 'include',
    headers: profile ? { 'Content-Type': 'application/json' } : undefined,
    body: profile ? JSON.stringify(profile) : undefined,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? `Could not ${method === 'DELETE' ? 'delete' : 'update'} user (${response.status}).`)
  }
}

export function deleteUser(id: string) {
  return changeUser(id, 'DELETE')
}

export function updateUser(id: string, profile: { name: string; email: string }) {
  return changeUser(id, 'PUT', profile)
}
