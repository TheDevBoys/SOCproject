export type UserRole = string

export type UserStatus = 'Active' | 'Inactive' | 'Invited'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  roleId: string
  roleName: string
  customerAccess: string
  twoFactor: boolean
  lastSignIn: string | null
  status: UserStatus
}
