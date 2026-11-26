import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Cases | DevBoys',
}

export default function CasesLayout({ children }: { children: ReactNode }) {
  return children
}
