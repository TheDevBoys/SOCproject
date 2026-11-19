export type CustomerStatus = 'Onboarding' | 'Active' | 'Inactive'

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

export type CustomerInput = Omit<Customer, 'id' | 'status'> //constructs a new object type by taking an existing type and removing specific properties