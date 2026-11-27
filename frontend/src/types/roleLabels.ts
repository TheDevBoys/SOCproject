const roleLabels: Record<string, string> = {
  Superuser: 'Superuser',
  Tier1: 'Tier 1 analyst',
  Tier2: 'Tier 2 analyst',
  Tier3: 'Tier 3 analyst',
  Engineer: 'Engineer',
  AccountManager: 'Account manager',
  ForensicAnalyst: 'Forensic analyst',
  Customer: 'Customer',
}



export function roleLabel(role: string, displayName?: string) {
  if (displayName && displayName !== role) return displayName
  return Object.hasOwn(roleLabels, role) ? roleLabels[role] : role
}
