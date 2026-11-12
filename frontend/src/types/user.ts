export type UserRole =
  | 'Superuser'
  | 'Tier1'
  | 'Tier2'
  | 'Tier3'
  | 'Engineer'
  | 'AccountManager'
  | 'ForensicAnalyst'
  | 'Customer'

export type UserStatus = 'Active' | 'Invited'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  customerAccess: string
  twoFactor: boolean
  lastSignIn: string | null
  status: UserStatus
}
