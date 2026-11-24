import type { User } from '../types/user'

export async function getUsers(): Promise<User[]> {
  const response = await fetch('/api/users')

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
