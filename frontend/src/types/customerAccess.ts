export type AccessLevel = 'NoAccess' | 'ReadOnly' | 'FullAccess'

export type CustomerAccess = {
  userId: number
  customer: string
  access: AccessLevel
  expires: string
  grantedBy: string
}

export type AccessRequest = {
  id: number
  userId: number
  customer: string
  reason: string
  duration: string
}
