'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '../../src/components/layout/Sidebar'
import PageTopbar from '../../src/components/layout/PageTopbar'
import Button from '../../src/components/ui/Button'
import styles from './page.module.css'
import type { Case, CaseSeverity, CaseStatus, CaseTab } from '../../src/types/case'

const currentUser = { name: 'R. Visser', tier: 2 }

const sampleCases: Case[] = [
  { id: 'CASE-2026-0147', title: 'Account compromise after phishing email', severity: 'Critical', customer: 'Bank Alpha', status: 'Containment', owner: 'R. Visser', tier: 2, slaRemaining: '00:31:07', alerts: 3, lastUpdate: '10:15' },
  { id: 'CASE-2026-0151', title: 'Unusual data export to external IP', severity: 'Critical', customer: 'Energy Zeta', status: 'Escalated', owner: '', tier: 2, slaRemaining: '00:42:30', alerts: 5, lastUpdate: '10:11', escalatedBy: 'S. Bakker' },
  { id: 'CASE-2026-0139', title: 'Suspicious sign-ins on admin portal', severity: 'High', customer: 'Municipality Gamma', status: 'Investigating', owner: 'S. Bakker', tier: 1, slaRemaining: '01:05:48', alerts: 2, lastUpdate: '10:09' },
  { id: 'CASE-2026-0144', title: 'Malware detected on file server', severity: 'High', customer: 'Bank Alpha', status: 'Investigating', owner: 'M. Jansen', tier: 1, slaRemaining: '01:48:02', alerts: 1, lastUpdate: '10:17' },
  { id: 'CASE-2026-0149', title: 'Backups being deleted on file server', severity: 'High', customer: 'Care Beta', status: 'Escalated', owner: '', tier: 2, slaRemaining: '02:11:20', alerts: 2, lastUpdate: '10:14', escalatedBy: 'M. Jansen' },
  { id: 'CASE-2026-0133', title: 'Suspected mailbox forwarding', severity: 'High', customer: 'Insurer Theta', status: 'Investigating', owner: 'L. Smit', tier: 3, slaRemaining: '02:30:15', alerts: 4, lastUpdate: '09:58' },
  { id: 'CASE-2026-0148', title: 'Exploit attempt on web application', severity: 'High', customer: 'Insurer Theta', status: 'Escalated', owner: '', tier: 2, slaRemaining: '02:55:05', alerts: 1, lastUpdate: '10:03', escalatedBy: 'S. Bakker' },
  { id: 'CASE-2026-0128', title: 'Credential stuffing on customer portal', severity: 'Medium', customer: 'Retail Epsilon', status: 'Investigating', owner: 'S. Bakker', tier: 1, slaRemaining: '05:12:44', alerts: 7, lastUpdate: '10:01' },
  { id: 'CASE-2026-0125', title: 'Phishing campaign targeting finance team', severity: 'Medium', customer: 'Logistics Delta', status: 'Waiting on customer', owner: 'R. Visser', tier: 2, slaRemaining: '07:40:10', alerts: 6, lastUpdate: '09:47' },
  { id: 'CASE-2026-0121', title: 'Outdated VPN client on laptops', severity: 'Low', customer: 'Education Eta', status: 'Waiting on customer', owner: 'M. Jansen', tier: 1, slaRemaining: '21:05:33', alerts: 2, lastUpdate: '09:30' },
  { id: 'CASE-2026-0118', title: 'Port scan from external host', severity: 'Low', customer: 'Logistics Delta', status: 'Investigating', owner: 'S. Bakker', tier: 1, slaRemaining: '22:18:09', alerts: 1, lastUpdate: '09:12' },
  { id: 'CASE-2026-0115', title: 'Brute force on RDP service', severity: 'High', customer: 'Care Beta', status: 'Closed', owner: 'L. Smit', tier: 3, slaRemaining: 'Met', alerts: 3, lastUpdate: 'Yesterday' },
  { id: 'CASE-2026-0110', title: 'Malicious attachment blocked', severity: 'Medium', customer: 'Bank Alpha', status: 'Closed', owner: 'M. Jansen', tier: 1, slaRemaining: 'Met', alerts: 1, lastUpdate: 'Yesterday' },
]

const tabs: { id: CaseTab; label: string }[] = [
  { id: 'mine', label: 'My cases' },
  { id: 'tier', label: 'My tier' },
  { id: 'open', label: 'All open' },
  { id: 'waiting', label: 'Waiting on customer' },
  { id: 'closed', label: 'Closed' },
]

const severityBadges: Record<CaseSeverity, string> = {
  Critical: styles.critical,
  High: styles.high,
  Medium: styles.medium,
  Low: styles.low,
}

const statusBadges: Record<CaseStatus, string> = {
  Investigating: styles.investigating,
  Containment: styles.investigating,
  Escalated: styles.escalated,
  'Waiting on customer': styles.waiting,
  Closed: styles.closed,
}

const pageSize = 8

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>(sampleCases)
  const [tab, setTab] = useState<CaseTab>('open')
  const [page, setPage] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  const queue = cases.filter(item => item.status === 'Escalated' && item.owner === '' && item.tier === currentUser.tier)
  const tabCases = casesForTab(tab).sort((a, b) => a.slaRemaining.localeCompare(b.slaRemaining))
  const visibleCases = tabCases.slice(page * pageSize, (page + 1) * pageSize)
  const lastPage = Math.max(Math.ceil(tabCases.length / pageSize) - 1, 0)

  function casesForTab(tabId: CaseTab) {
    if (tabId === 'closed') {
      return cases.filter(item => item.status === 'Closed')
    }

    const openCases = cases.filter(item => item.status !== 'Closed')

    if (tabId === 'mine') {
      return openCases.filter(item => item.owner === currentUser.name)
    }
    if (tabId === 'tier') {
      return openCases.filter(item => item.tier === currentUser.tier)
    }
    if (tabId === 'waiting') {
      return openCases.filter(item => item.status === 'Waiting on customer')
    }
    return openCases
  }

  function ownerLabel(caseItem: Case) {
    return caseItem.owner ? `${caseItem.owner} (T${caseItem.tier})` : `Tier ${caseItem.tier} queue`
  }

  function selectTab(tabId: CaseTab) {
    setTab(tabId)
    setPage(0)
  }

  function pickUp(caseItem: Case) {
    const pickedUp: Case = { ...caseItem, owner: currentUser.name, status: 'Investigating' }
    setCases(cases.map(item => item.id === caseItem.id ? pickedUp : item))
  }

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <PageTopbar title="Workspace / Cases" userName={currentUser.name} userRole="Tier 2" twoFactorEnabled={true} sampleData={true} />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <h1>Cases</h1>
            <p>Investigations created from alerts. Escalated cases wait in the right tier queue until someone picks them up.</p>
          </div>

          <section className={[styles.card, styles.queue].join(' ')} aria-labelledby="queue-heading">
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <h2 id="queue-heading">Tier {currentUser.tier} queue</h2>
                <span className={styles.queueCount}>{queue.length} escalated, not picked up yet</span>
              </div>
            </div>
            {queue.length === 0 ? (
              <p className={styles.empty}>No escalated cases are waiting in this queue.</p>
            ) : (
              <ul className={styles.queueList}>
                {queue.map(item => (
                  <li key={item.id} className={styles.queueItem}>
                    <span className={[styles.pill, severityBadges[item.severity]].join(' ')}>{item.severity}</span>
                    <div className={styles.queueText}>
                      <p>
                        <Link href="/cases" className={styles.caseLink}>{item.id}</Link> {item.title}
                      </p>
                      <p className={styles.muted}>{item.customer} · escalated by {item.escalatedBy} at {item.lastUpdate}</p>
                    </div>
                    <span className={[styles.sla, styles.slaWarning].join(' ')}>{item.slaRemaining}</span>
                    <Button type="button" onClick={() => pickUp(item)}>Pick up</Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <nav className={styles.tabs} aria-label="Case lists">
            {tabs.map(item => (
              <button
                key={item.id}
                type="button"
                className={item.id === tab ? styles.selectedTab : undefined}
                aria-pressed={item.id === tab}
                onClick={() => selectTab(item.id)}
              >
                {item.label} {item.id !== 'closed' && casesForTab(item.id).length}
              </button>
            ))}
          </nav>

          <section className={styles.card} aria-label="Cases">
            <div className={styles.tableScroll} role="region" aria-label="Cases table" tabIndex={0}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Case</th>
                    <th scope="col">Severity</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Status</th>
                    <th scope="col">Owner</th>
                    <th scope="col">SLA remaining</th>
                    <th scope="col">Alerts</th>
                    <th scope="col">Last update</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCases.map(item => (
                    <tr key={item.id}>
                      <td>
                        <Link href="/cases" className={styles.caseLink}>{item.id}</Link>
                        <span className={styles.caseTitle}>{item.title}</span>
                      </td>
                      <td>
                        <span className={[styles.pill, severityBadges[item.severity]].join(' ')}>{item.severity}</span>
                      </td>
                      <td>{item.customer}</td>
                      <td>
                        <span className={[styles.pill, statusBadges[item.status]].join(' ')}>{item.status}</span>
                      </td>
                      <td>{ownerLabel(item)}</td>
                      <td>
                        <span className={[styles.sla, item.slaRemaining.startsWith('00:') && styles.slaWarning].filter(Boolean).join(' ')}>{item.slaRemaining}</span>
                      </td>
                      <td>{item.alerts}</td>
                      <td className={[styles.mono, styles.muted].join(' ')}>{item.lastUpdate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.cardFooter}>
              <p>
                {tabCases.length === 0
                  ? 'No cases in this list.'
                  : `Showing ${page * pageSize + 1}–${page * pageSize + visibleCases.length} of ${tabCases.length} cases, sorted by remaining SLA time`}
              </p>
              <div className={styles.actions}>
                <Button type="button" variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button type="button" variant="secondary" disabled={page === lastPage} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
