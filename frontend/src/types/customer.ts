export type CustomerStatus = 'Onboarding' | 'Active' | 'Inactive'

export type Customer = {
  id: number
  name: string
  sector: string
  slaProfile: string
  defaultRetentionDays: 30 | 90
  contactName: string
  contactEmail: string
  status: CustomerStatus
}

export type CustomerInput = Omit<Customer, 'id' | 'status'> //constructs a new object type by taking an existing type and removing specific properties