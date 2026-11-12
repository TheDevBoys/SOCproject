import type { User } from '../types/user'

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
