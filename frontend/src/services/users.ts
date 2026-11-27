import type { User, UserStatus } from '../types/user'

export async function getUsers(): Promise<User[]> {
  const response = await fetch('/api/users', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
async function changeUser(path: string, method: 'PUT' | 'DELETE', body?: object) {
  const response = await fetch(`/api/users/${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
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

export function setUserStatus(id: string, status: Exclude<UserStatus, 'Invited'>) {
  return changeUser(`${id}/status`, 'PUT', { status })
}
