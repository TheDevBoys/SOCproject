'use client'

import { useState, type ReactNode } from 'react'
import Sidebar from '../../src/components/layout/Sidebar'
import styles from '../account/page.module.css'
import PageTopbar from '../../src/components/layout/PageTopbar'

export default function AccountLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <PageTopbar title="Dashboard" userName="(NAAM)" userRole="Tier 1" twoFactorEnabled={true} sampleData={true} />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}
