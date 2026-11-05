'use client'

import { useState, type ReactNode } from 'react'
import Sidebar from '../../src/components/layout/Sidebar'
import styles from './page.module.css'
import DropDown from '../../src/components/ui/DropDown'
import Button from '../../src/components/ui/Button'
import Card from '../../src/components/ui/Card'
import AlertsChart from '../../src/components/reports/AlertsCharts'
import AlertCaseSummary from '../../src/components/reports/AlertCaseSummary'
import SLAComplianceTable from '../../src/components/reports/SLAComplianceTable'

export default function ReportsPage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <header className={styles.topbar}>
      
          <div className={styles.badges}>
            <span>Sample data</span>
            <span>(NAAM) - Tier 1 - 2FA on</span>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.reportsHeader}>
            <h1>SOC reports</h1>
            <DropDown defaultValue="" className={styles.dropDown}  fullWidth>
                <option value="">Last 30 days</option>
            </DropDown>
          </div>
          
          <p>How the SOC performs over a longer period. The dashboard shows what is happening now; this page shows the trend</p>
          <div className={styles.reportsFilter} aria-label="Report sections">
            <DropDown defaultValue="" className={styles.dropDown} fullWidth>
                <option value="">All customers with access (3)</option>
            </DropDown>
            <Button variant="secondary" type="button" aria-disabled="true">Export (PDF)</Button>
          </div>
          <div className={styles.cardContainer}>
            <Card title="SLA compliance" titleId="sla-compliance">
              <h2>97.2%</h2>
              <p>279 of 287 cases within SLA</p>
            </Card>

            <Card title="Average first response" titleId="average-response">
              <h2>06:48</h2>
              <p>min:sec, last 30 days</p>
            </Card>

            <Card title="Average time to contain critical" titleId="containment-time">
              <h2>35 min</h2>
              <p>target: within 1 hour</p>
            </Card>

            <Card title="Alerts closed as false positive" titleId="false-positive">
              <h2>79%</h2>
              <p>of 312 thousand alerts</p>
            </Card>
          </div>
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
