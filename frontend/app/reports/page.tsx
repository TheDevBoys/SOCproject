'use client'

import { useState } from 'react'
import Sidebar from '../../src/components/layout/Sidebar'
import styles from './page.module.css'
import DropDown from '../../src/components/ui/DropDown'
import Button from '../../src/components/ui/Button'
import AlertsChart from '../../src/components/reports/AlertsCharts'
import AlertCaseSummary from '../../src/components/reports/AlertCaseSummary'
import SLAComplianceTable from '../../src/components/reports/SLAComplianceTable'

const metrics = [
  { label: 'SLA compliance', value: '97.2%', detail: '279 of 287 cases within SLA' },
  { label: 'Average first response', value: '06:48', detail: 'min:sec, last 30 days' },
  { label: 'Average time to contain critical', value: '35 min', detail: 'target: within 1 hour' },
  { label: 'Alerts closed as false positive', value: '79%', detail: 'of 312 thousand alerts' },
]

export default function ReportsPage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <p>Reporting / SOC reports</p>
          <div className={styles.badges}>
            <span>Sample data</span>
            <span>A. Mulder - Account manager · 2FA on</span>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.reportsHeader}>
            <div>
              <h1>SOC reports</h1>
              <p>How the SOC performs over a longer period. The dashboard shows what is happening now; this page shows the trend.</p>
            </div>
            <DropDown aria-label="Reporting period" defaultValue="30">
              <option value="30">Last 30 days</option>
            </DropDown>
          </div>
          <div className={styles.reportsFilter}>
            <DropDown aria-label="Customer filter" defaultValue="all">
              <option value="all">All customers with access (3)</option>
            </DropDown>
            <Button variant="secondary" type="button" aria-disabled="true">Export (PDF)</Button>
          </div>
          <dl className={styles.cardContainer}>
            {metrics.map(metric => (
              <div key={metric.label} className={styles.metric}>
                <dt>{metric.label}</dt>
                <dd>
                  <strong>{metric.value}</strong>
                  <span>{metric.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className={styles.reportsOverview}>
            <AlertsChart />
            <AlertCaseSummary />
          </div>
          <div className={styles.reportsTable}>
            <SLAComplianceTable />
          </div>
        </main>
      </div>
    </div>
  )
}
