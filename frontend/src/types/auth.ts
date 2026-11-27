import type { UserRole } from './user'

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  success: boolean
  requiresMfa: boolean
  message: string
}

export type MfaSetup = {
  setupRequired: boolean
  secret: string
  qrCodeUri: string
}

export type CurrentUser = {
  id: string
  name: string
  email: string
  role: UserRole
  roleId: string
  roleName: string
  permissions: string[]
  customerAccessCount: number
  mfaEnabled: boolean
}
