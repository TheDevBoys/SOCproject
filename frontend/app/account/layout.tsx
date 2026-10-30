'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Sidebar from '../../src/components/layout/Sidebar'
import styles from './page.module.css'

export default function AccountLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const isSecurity = usePathname() === '/account/security'

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <p>My account / {isSecurity ? 'Security' : 'Profile'}</p>
          <div className={styles.badges}>
            <span>Sample data</span>
            <span>(NAAM) - Tier 1 - 2FA on</span>
          </div>
        </header>
        <main className={styles.main}>
          <h1>My account</h1>
          <nav className={styles.tabs} aria-label="Account sections">
            <Link href="/account" className={!isSecurity ? styles.selectedTab : undefined} aria-current={!isSecurity ? 'page' : undefined}>Profile</Link>
            <Link href="/account/security" className={isSecurity ? styles.selectedTab : undefined} aria-current={isSecurity ? 'page' : undefined}>Security</Link>
          </nav>
          {children}
        </main>
      </div>
    </div>
  )
}
