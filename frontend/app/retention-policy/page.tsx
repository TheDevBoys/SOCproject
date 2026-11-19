'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '../../src/components/layout/Sidebar'
import PageTopbar from '../../src/components/layout/PageTopbar'
import Button from '../../src/components/ui/Button'
import Card from '../../src/components/ui/Card'
import styles from './page.module.css'

type RetentionTone = 'short' | 'long' | 'mixed' | 'neutral'

type DataTypePolicy = {
  dataType: string
  retention: string
  tone: RetentionTone
  countedFrom: string
  override: 'Yes' | 'No'
  whenExpired: string
}

const policies: DataTypePolicy[] = [
  { dataType: 'Alerts, false positive', retention: '30 days', tone: 'short', countedFrom: 'Alert closed', override: 'Yes', whenExpired: 'Deleted' },
  { dataType: 'Alerts, promoted to case', retention: 'Follows the case', tone: 'neutral', countedFrom: 'Case closed', override: 'No', whenExpired: 'Deleted with the case' },
  { dataType: 'Closed cases (tasks, chat, timeline)', retention: '90 days', tone: 'long', countedFrom: 'Case closed', override: 'Yes', whenExpired: 'Deleted' },
  { dataType: 'Evidence attachments', retention: '30 or 90 days', tone: 'mixed', countedFrom: 'Label per file', override: 'Yes', whenExpired: 'Deleted' },
  { dataType: 'Audit log', retention: '[to be decided]', tone: 'neutral', countedFrom: 'Created', override: 'No', whenExpired: 'Archived' },
]

const deletionRun = {
  lastRun: 'today 03:00',
  lastRunDeleted: 18204,
  nextRun: 'tomorrow 03:00',
  expiring: [
    { label: 'Label 30 days', count: 41802, tone: 'short' as const },
    { label: 'Label 90 days', count: 11109, tone: 'long' as const },
  ],
}

const expiringTotal = deletionRun.expiring.reduce((sum, item) => sum + item.count, 0)

const legalHolds = [
  { caseId: 'CASE-2026-0098', customer: 'Bank Alpha', reason: 'Regulator investigation', since: '12-09-2026' },
  { caseId: 'CASE-2026-0071', customer: 'Care Beta', reason: 'Legal dispute', since: '28-08-2026' },
]

const customerOverrides = [
  { customer: 'Energy Zeta', falsePositives: '90 days', cases: '90 days', evidence: '90 days', reason: 'Contract agreement, longer' },
  { customer: 'Education Eta', falsePositives: '30 days', cases: '30 days', evidence: '30 days', reason: 'Contract agreement, shorter' },
]

const formatNumber = (value: number) => value.toLocaleString('en-US')

export default function RetentionPolicyPage() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <PageTopbar title="Management / Retention policy" userName="K. Hendriks" userRole="Superuser" twoFactorEnabled={true} sampleData={true} />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <h1>Retention policy</h1>
            <p>How long data is kept. Data with a 30 or 90 day retention period is deleted automatically and permanently when it expires.</p>
          </div>

          <Card title="Default policy per data type" titleId="default-policy-title" flush>
            <div className={styles.tableScroll} role="region" aria-label="Default policy per data type table" tabIndex={0}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Data type</th>
                    <th scope="col">Retention</th>
                    <th scope="col">Counted from</th>
                    <th scope="col">Per-customer override</th>
                    <th scope="col">When expired</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map(policy => (
                    <tr key={policy.dataType}>
                      <th scope="row">{policy.dataType}</th>
                      <td><span className={[styles.pill, styles[policy.tone]].join(' ')}>{policy.retention}</span></td>
                      <td>{policy.countedFrom}</td>
                      <td>{policy.override}</td>
                      <td>{policy.whenExpired}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.cardNote}>The audit log retention period is not set yet and must be agreed with the client.</p>
          </Card>

          <div className={styles.columns}>
            <Card title="Deletion run" titleId="deletion-run-title" badge={<span className={styles.successBadge}>Last run succeeded</span>}>
              <dl className={styles.details}>
                <div><dt>Last run</dt><dd>{deletionRun.lastRun}, {formatNumber(deletionRun.lastRunDeleted)} records deleted</dd></div>
                <div><dt>Next run</dt><dd>{deletionRun.nextRun}</dd></div>
                <div><dt>Within 7 days</dt><dd><strong className={styles.number}>{formatNumber(expiringTotal)}</strong> records expire</dd></div>
              </dl>
              <div className={styles.bars}>
                {deletionRun.expiring.map(item => (
                  <div key={item.label} className={styles.bar}>
                    <div className={styles.barLabel}>
                      <span>{item.label}</span>
                      <strong className={styles.number}>{formatNumber(item.count)}</strong>
                    </div>
                    <div className={styles.track} aria-hidden="true">
                      <div className={[styles.fill, styles[item.tone]].join(' ')} style={{ width: `${(item.count / expiringTotal) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.runActions}>
                <Button variant="primary" type="button" aria-disabled="true">Run dry run</Button>
                <p>Shows what would be removed without deleting anything.</p>
              </div>
            </Card>

            <Card title="Legal hold" titleId="legal-hold-title" badge={<span className={styles.warningBadge}>{legalHolds.length} cases</span>} flush>
              <ul className={styles.holdList}>
                {legalHolds.map(hold => (
                  <li key={hold.caseId}>
                    <p className={styles.holdTitle}>
                      <Link href="/cases" className={styles.caseLink}>{hold.caseId}</Link> {hold.customer}
                    </p>
                    <p className={styles.holdMeta}>{hold.reason} · since {hold.since}</p>
                  </li>
                ))}
              </ul>
              <div className={styles.holdFooter}>
                <p>Cases under legal hold are excluded from automatic deletion until a superuser lifts the hold.</p>
                <Button variant="secondary" type="button" aria-disabled="true">Set legal hold</Button>
              </div>
            </Card>
          </div>

          <Card
            title="Customer overrides"
            titleId="customer-overrides-title"
            badge={<Button variant="secondary" type="button" className={styles.headerAction} aria-disabled="true">Add override</Button>}
            flush
          >
            <div className={styles.tableScroll} role="region" aria-label="Customer overrides table" tabIndex={0}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">False positives</th>
                    <th scope="col">Cases</th>
                    <th scope="col">Evidence</th>
                    <th scope="col">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOverrides.map(override => (
                    <tr key={override.customer}>
                      <th scope="row">{override.customer}</th>
                      <td className={styles.number}>{override.falsePositives}</td>
                      <td className={styles.number}>{override.cases}</td>
                      <td className={styles.number}>{override.evidence}</td>
                      <td>{override.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
