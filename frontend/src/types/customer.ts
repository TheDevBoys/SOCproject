export type CustomerStatus = 'Active' | 'Onboarding' | 'Inactive'

export type DataIsolation = 'SharedRowLevelSecurity' | 'OwnSchema' | 'OwnDatabase'

export type Customer = {
  id: number
  name: string
  sector: string
  dataIsolation: DataIsolation
  slaProfile: string
  retentionDays: number
  dataResidency: string
  contactName: string
  contactEmail: string
  status: CustomerStatus
}
