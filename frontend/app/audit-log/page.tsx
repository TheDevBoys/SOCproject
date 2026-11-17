'use client'

import { useState } from 'react'
import Sidebar from '../../src/components/layout/Sidebar'
import styles from './page.module.css'
import PageTopbar from '../../src/components/layout/PageTopbar'
import Button from '../../src/components/ui/Button'
import SearchField from '../../src/components/ui/SearchField'
import DropDown from '../../src/components/ui/DropDown'

type AuditLog = {
  timestamp: string
  user: string
  action: string
  object: string
  ipAddress: string
}

const AuditLogs: AuditLog[] = [
  { timestamp: '2026-11-12 10:45:00', user: 'K. Hendriks', action: 'User role updated', object: 'User M. Jansen', ipAddress: '192.168.1.10' },
  { timestamp: '2026-11-12 10:32:00', user: 'R. Visser', action: 'Evidence downloaded', object: 'Case-123', ipAddress: '192.168.1.24' },
  { timestamp: '2026-11-12 10:18:00', user: 'M. Jansen', action: 'Created a new case', object: 'Case-124', ipAddress: '192.168.1.15' },
  { timestamp: '2026-11-12 10:05:00', user: 'L. Smit', action: 'Case escalated', object: 'Case-122', ipAddress: '192.168.1.31' },
  { timestamp: '2026-11-12 09:52:00', user: 'S. Bakker', action: 'Alert closed as false positive', object: 'Alert-458', ipAddress: '192.168.1.18' },
  { timestamp: '2026-11-12 09:40:00', user: 'K. Hendriks', action: 'Customer access granted', object: 'Bank Alpha / R. Visser', ipAddress: '192.168.1.10' },
  { timestamp: '2026-11-12 09:28:00', user: 'A. Mulder', action: 'Report viewed', object: 'Care Beta / Monthly report', ipAddress: '192.168.1.42' },
  { timestamp: '2026-11-12 09:15:00', user: 'R. Visser', action: 'Case closed', object: 'Case-119', ipAddress: '192.168.1.24' },
  { timestamp: '2026-11-12 09:02:00', user: 'K. Hendriks', action: 'User invited', object: 'User N. Prins', ipAddress: '192.168.1.10' },
  { timestamp: '2026-11-12 08:50:00', user: 'L. Smit', action: 'Audit log viewed', object: 'Audit log', ipAddress: '192.168.1.31' },
  { timestamp: '2026-11-12 08:35:00', user: 'M. Jansen', action: 'Sign-in succeeded', object: 'User M. Jansen', ipAddress: '192.168.1.15' },
  { timestamp: '2026-11-12 08:33:00', user: 'M. Jansen', action: 'Two-factor verification failed', object: 'User M. Jansen', ipAddress: '192.168.1.15' },
]

export default function AuditLogPage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <PageTopbar title="Management / Audit log" userName="K. Hendriks" userRole="Superuser" twoFactorEnabled={true} sampleData={true} />
        <main className={styles.main}>
          <div className={styles.pageHeaderWrapper}>
            <div className={styles.pageHeader}>
              <h1>Audit log</h1>
              <p>Track user activity, access changes and case actions. All entries shown are sample data.</p>
            </div>
            <Button type="button" variant="secondary">Export (CSV)</Button>
          </div>
          <div className={styles.searchHeader}>
            <div className={styles.searchHeaderLeft}>
              <SearchField id="audit-log-search" label="Search" placeholder="Case, alert, file or IP" />
            </div>
            <div className={styles.searchHeaderRight}>
              <DropDown id="audit-log-period" label="Period">
                <option value="">Last 24 hours</option>
                <option value="">Last 7 days</option>
                <option value="">Last 30 days</option>
              </DropDown>
              <DropDown id="audit-log-user" label="User" >
                <option value="">All users</option>
              </DropDown>
              <DropDown id="audit-log-customer" label="Customer">
                <option value="">All customers</option>
              </DropDown>
              <DropDown id="audit-log-actionType" label="Action Type">
                <option value="">All actions</option>
              </DropDown>
            </div>
          </div>
          <section className={styles.card} aria-labelledby="audit-log-heading">
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Timestamp</th>
                    <th scope="col">User</th>
                    <th scope="col">Action</th>
                    <th scope="col">Object</th>
                    <th scope="col">IP address</th>
                  </tr>
                </thead>
                <tbody>
                  {AuditLogs.map(log => (
                    <tr key={`${log.timestamp}-${log.user}-${log.action}`}>
                      <td className={styles.muted}>{log.timestamp}</td>
                      <td className={styles.userName}>{log.user}</td>
                      <td>{log.action}</td>
                      <td>{log.object}</td>
                      <td className={styles.muted}>{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.cardFooter}>
              <p className={styles.subtitle}>Showing {AuditLogs.length} of {AuditLogs.length} entries</p>
            </div>
          </section>
        </main>
      </div>
  </div>
  )
}
