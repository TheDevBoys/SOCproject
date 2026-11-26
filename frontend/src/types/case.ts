export type CaseSeverity = 'Low' | 'Medium' | 'High' | 'Critical'

export type CaseStatus = 'Investigating' | 'Containment' | 'Escalated' | 'Waiting on customer' | 'Closed'

export type CaseTab = 'mine' | 'tier' | 'open' | 'waiting' | 'closed'

export type Case = {
  id: string
  title: string
  severity: CaseSeverity
  customer: string
  status: CaseStatus
  owner: string
  tier: number
  slaRemaining: string
  alerts: number
  lastUpdate: string
  escalatedBy?: string
}
