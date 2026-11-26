'use client'

import { useState } from 'react'
import Sidebar from '../../src/components/layout/Sidebar'
import PageTopbar from '../../src/components/layout/PageTopbar'
import Button from '../../src/components/ui/Button'
import Card from '../../src/components/ui/Card'
import SearchField from '../../src/components/ui/SearchField'
import DropDown from '../../src/components/ui/DropDown'
import styles from './page.module.css'

/* =========================
   Types
========================= */

type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
type Source = 'SIEM' | 'EDR' | 'NDR'
type Status = 'New' | 'In triage'
type Verdict = 'malicious' | 'internal' | 'suspicious'

type Alert = {
  id: string
  severity: Severity
  score: number
  title: string
  source: Source
  sourceDetail: string
  customer: string
  receivedTime: string
  receivedMinutesAgo: number
  slaRemaining: string // HH:MM:SS
  assigned: string | null
  status: Status
}

type Observable = {
  type: string
  value: string
  verdict: Verdict
  seenBefore: string
}

type AlertDetail = {
  summary: { label: string; value: string; mono?: boolean }[]
  observables: Observable[]
  slaProfile: string
  retention: string
  relatedAlerts: { title: string; meta: string }[]
  activity: { time: string; text: string }[]
  rawPayload: object
}

/* =========================
   Sample data (replace with API data later)
========================= */

// TODO: the total comes from the API once the frontend is connected to the backend.
const totalOpenAlerts = 12480

const alerts: Alert[] = [
  { id: 'ALR-884213', severity: 'Critical', score: 98, title: 'Ransomware behaviour: mass file encryption', source: 'EDR', sourceDetail: 'BA-WKS-0412', customer: 'Bank Alpha', receivedTime: '09:41', receivedMinutesAgo: 41, slaRemaining: '00:18:42', assigned: 'M. Jansen', status: 'In triage' },
  { id: 'ALR-884219', severity: 'Critical', score: 96, title: 'Outbound traffic to known C2 domain', source: 'NDR', sourceDetail: 'sensor ZB-NDR-02', customer: 'Care Beta', receivedTime: '09:48', receivedMinutesAgo: 34, slaRemaining: '00:26:10', assigned: null, status: 'New' },
  { id: 'ALR-884102', severity: 'High', score: 84, title: 'Brute-force attempts on VPN gateway (412×)', source: 'SIEM', sourceDetail: 'vpn-gw-01', customer: 'Municipality Gamma', receivedTime: '07:10', receivedMinutesAgo: 3 * 60 + 12, slaRemaining: '00:48:05', assigned: 'S. Bakker', status: 'In triage' },
  { id: 'ALR-884117', severity: 'High', score: 79, title: 'Suspicious PowerShell run with encoded command', source: 'EDR', sourceDetail: 'BA-SRV-0120', customer: 'Bank Alpha', receivedTime: '07:35', receivedMinutesAgo: 2 * 60 + 47, slaRemaining: '01:12:33', assigned: null, status: 'New' },
  { id: 'ALR-884031', severity: 'Medium', score: 61, title: 'Phishing email reported by user', source: 'SIEM', sourceDetail: 'mailgateway', customer: 'Retail Epsilon', receivedTime: '04:27', receivedMinutesAgo: 5 * 60 + 55, slaRemaining: '02:05:19', assigned: null, status: 'New' },
  { id: 'ALR-884064', severity: 'Medium', score: 52, title: 'Unknown device on internal network segment', source: 'NDR', sourceDetail: 'sensor LD-NDR-01', customer: 'Logistics Delta', receivedTime: '06:02', receivedMinutesAgo: 4 * 60 + 20, slaRemaining: '03:40:00', assigned: null, status: 'New' },
  { id: 'ALR-884071', severity: 'Medium', score: 49, title: 'Repeated MFA denials for one account', source: 'SIEM', sourceDetail: 'IdP-logs', customer: 'Energy Zeta', receivedTime: '06:20', receivedMinutesAgo: 4 * 60 + 2, slaRemaining: '03:58:12', assigned: 'M. Jansen', status: 'In triage' },
  { id: 'ALR-883912', severity: 'Low', score: 30, title: 'Potentially unwanted program blocked', source: 'EDR', sourceDetail: 'OE-LAP-0388', customer: 'Education Eta', receivedTime: 'yesterday 17:44', receivedMinutesAgo: 16 * 60 + 38, slaRemaining: '07:21:44', assigned: null, status: 'New' },
  { id: 'ALR-884155', severity: 'Low', score: 14, title: 'Outdated TLS version on web server', source: 'SIEM', sourceDetail: 'web-prod-03', customer: 'Insurer Theta', receivedTime: '08:32', receivedMinutesAgo: 1 * 60 + 50, slaRemaining: '22:10:30', assigned: null, status: 'New' },
  { id: 'ALR-884201', severity: 'Low', score: 11, title: 'Port scan from external IP, low volume', source: 'NDR', sourceDetail: 'sensor GG-NDR-01', customer: 'Municipality Gamma', receivedTime: '09:24', receivedMinutesAgo: 58, slaRemaining: '23:02:09', assigned: null, status: 'New' },
]

const customers = Array.from(new Set(alerts.map(alert => alert.customer))).sort()

// Only ALR-884213 has full sample details for now.
const alertDetails: Record<string, AlertDetail> = {
  'ALR-884213': {
    summary: [
      { label: 'Title', value: 'Ransomware behaviour: mass file encryption' },
      { label: 'Time', value: '2026-10-06 09:41:12 (UTC+2)', mono: true },
      { label: 'Severity', value: 'Critical (severity_id 5)' },
      { label: 'Device', value: 'BA-WKS-0412 · 10.20.4.112', mono: true },
      { label: 'User', value: 'b.devries@bankalpha.example', mono: true },
      { label: 'Process', value: 'svchost_upd.exe (parent: winword.exe)', mono: true },
      { label: 'Detection', value: 'More than 1,800 files renamed and encrypted in 90 seconds' },
      { label: 'Source', value: 'EDR agent, product name from metadata.product.name' },
    ],
    observables: [
      {
        type: 'Hash (SHA-256)',
        value: '9f2c4b7e1a03d5c8b6e24f90a7d1c3e5b8f2a4d6c0e91735ab4cd2e8f6e41a',
        verdict: 'malicious',
        seenBefore: '2 alerts, last 14 days',
      },
      { type: 'IP address', value: '10.20.4.112', verdict: 'internal', seenBefore: '5 alerts, last 30 days' },
      { type: 'File name', value: 'svchost_upd.exe', verdict: 'suspicious', seenBefore: 'Not seen before' },
    ],
    slaProfile: 'Premium 24/7',
    retention: '30 days after closing',
    relatedAlerts: [
      { title: 'Suspicious macro run in winword.exe', meta: 'Same device, 6 minutes earlier' },
      { title: 'Unusual SMB connections from BA-WKS-0412', meta: 'Same device, 5 minutes later' },
      { title: 'Phishing email with attachment received by b.devries', meta: 'Same user, 38 minutes earlier' },
    ],
    activity: [
      { time: '10:02', text: 'M. Jansen picked up the alert (status: in triage).' },
      { time: '09:41', text: 'Alert received through the API and linked to Bank Alpha.' },
      { time: '09:41', text: 'SLA clock started: critical, 1 hour to contain.' },
    ],
    rawPayload: {
      class_uid: 2004,
      class_name: 'Detection Finding',
      time: 1791272472000,
      severity_id: 5,
      status_id: 1,
      finding_info: {
        title: 'Ransomware behaviour: mass file encryption',
      },
      device: { hostname: 'BA-WKS-0412', ip: '10.20.4.112' },
      observables: [
        { name: 'device.ip', type: 'IP Address', type_id: 2, value: '10.20.4.112' },
        { name: 'file.hashes[0].value', type: 'Hash', type_id: 8, value: '9f2c4b7e...e41a' },
      ],
    },
  },
}

const verdictLabels: Record<Verdict, string> = {
  malicious: 'Malicious',
  internal: 'Internal',
  suspicious: 'Suspicious',
}

const severityClass: Record<Severity, string> = {
  Critical: styles.critical,
  High: styles.high,
  Medium: styles.medium,
  Low: styles.low,
}

const statusClass: Record<Status, string> = {
  New: styles.new,
  'In triage': styles.triage,
}

// SLA under one hour is shown as urgent
const isSlaUrgent = (sla: string) => Number(sla.slice(0, 2)) < 1

// 192 -> "3 h 12 min ago"
const formatAgo = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours > 0 ? `${hours} h ${rest} min ago` : `${rest} min ago`
}

/* =========================
   Page
========================= */

export default function AlertQueuePage() {
  const [collapsed, setCollapsed] = useState(false)
  const [openAlertId, setOpenAlertId] = useState<string | null>(null)

  const openAlert = alerts.find(alert => alert.id === openAlertId)

  return (
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <PageTopbar
          title={openAlert ? `Alert queue / ${openAlert.id}` : 'Workspace / Alert queue'}
          userName="M. Jansen"
          userRole="Tier 1"
          twoFactorEnabled={true}
          sampleData={true}
        />
        <main className={styles.main}>
          {openAlert ? (
            <AlertDetailView alert={openAlert} onBack={() => setOpenAlertId(null)} />
          ) : (
            <AlertListView onOpen={setOpenAlertId} />
          )}
        </main>
      </div>
    </div>
  )
}

/* =========================
   Screen 1: alert list
========================= */

function AlertListView({ onOpen }: { onOpen: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [customer, setCustomer] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState('open')
  const [sort, setSort] = useState('priority')
  const [selected, setSelected] = useState<string[]>([])

  const query = search.trim().toLowerCase()

  const visibleAlerts = alerts
    .filter(alert =>
      !query ||
      alert.title.toLowerCase().includes(query) ||
      alert.id.toLowerCase().includes(query) ||
      alert.sourceDetail.toLowerCase().includes(query),
    )
    .filter(alert => customer === 'all' || alert.customer === customer)
    .filter(alert => severity === 'all' || alert.severity === severity)
    .filter(alert => source === 'all' || alert.source === source)
    .filter(alert => status === 'open' || alert.status === status)
    .sort((a, b) => {
      if (sort === 'sla') return a.slaRemaining.localeCompare(b.slaRemaining)
      if (sort === 'received') return a.receivedMinutesAgo - b.receivedMinutesAgo
      return b.score - a.score
    })

  const toggleSelected = (id: string) => {
    setSelected(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    )
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Alert queue</h1>
          <p>
            {totalOpenAlerts.toLocaleString('en-US')} open alerts, sorted by priority: severity and remaining SLA
            time set the order, not arrival time.
          </p>
        </div>
        {/* TODO: show the real time of the last update once alerts are loaded from the backend */}
        <span className={styles.live}>
          <span className={styles.liveDot} aria-hidden="true" />
          Live, last update 10:22:04
        </span>
      </div>

      <section className={styles.filters} aria-label="Filter alerts">
        <SearchField
          id="alert-search"
          label="Search"
          placeholder="IP, hash, domain or title"
          value={search}
          onChange={event => setSearch(event.target.value)}
          containerClassName={styles.searchFilter}
        />
        <DropDown id="alert-customer" label="Customer" value={customer} onChange={event => setCustomer(event.target.value)}>
          <option value="all">All assigned ({customers.length})</option>
          {customers.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </DropDown>
        <DropDown id="alert-severity" label="Severity" value={severity} onChange={event => setSeverity(event.target.value)}>
          <option value="all">All</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </DropDown>
        <DropDown id="alert-source" label="Source" value={source} onChange={event => setSource(event.target.value)}>
          <option value="all">SIEM, EDR, NDR</option>
          <option value="SIEM">SIEM</option>
          <option value="EDR">EDR</option>
          <option value="NDR">NDR</option>
        </DropDown>
        <DropDown id="alert-status" label="Status" value={status} onChange={event => setStatus(event.target.value)}>
          <option value="open">Open (new + in triage)</option>
          <option value="New">New</option>
          <option value="In triage">In triage</option>
        </DropDown>
        <DropDown id="alert-sort" label="Sort" value={sort} onChange={event => setSort(event.target.value)}>
          <option value="priority">Priority</option>
          <option value="sla">SLA remaining</option>
          <option value="received">Newest first</option>
        </DropDown>
      </section>

      {selected.length > 0 && (
        <section className={styles.bulkBar} aria-label="Bulk actions">
          <strong>{selected.length} selected</strong>
          {/* TODO: connect these actions to the backend */}
          <Button className={styles.smallButton}>Promote to case</Button>
          <Button variant="secondary" className={styles.smallButton}>Assign to me</Button>
          <Button variant="secondary" className={styles.smallButton}>Close as false positive</Button>
          <span className={styles.bulkNote}>Every action is recorded per alert in the audit log.</span>
        </section>
      )}

      <section className={styles.tableCard} aria-label="Open alerts">
        <div className={styles.tableScroll} role="region" aria-label="Open alerts table" tabIndex={0}>
          <table className={`${styles.table} ${styles.queueTable}`}>
            <thead>
              <tr>
                <th scope="col"><span className={styles.visuallyHidden}>Select</span></th>
                <th scope="col">Severity · score</th>
                <th scope="col">Alert</th>
                <th scope="col">Customer</th>
                <th scope="col">Received</th>
                <th scope="col">SLA remaining</th>
                <th scope="col">Assigned</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleAlerts.map(alert => (
                <tr key={alert.id} className={selected.includes(alert.id) ? styles.selectedRow : undefined}>
                  <td>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selected.includes(alert.id)}
                      onChange={() => toggleSelected(alert.id)}
                      aria-label={`Select ${alert.title}`}
                    />
                  </td>
                  <td>
                    <span className={styles.severityCell}>
                      <span className={`${styles.pill} ${severityClass[alert.severity]}`}>{alert.severity}</span>
                      <span className={styles.score}>{alert.score}</span>
                    </span>
                  </td>
                  <td>
                    <button type="button" className={styles.alertLink} onClick={() => onOpen(alert.id)}>
                      {alert.title}
                    </button>
                    <span className={styles.subText}>{alert.source} · {alert.sourceDetail}</span>
                  </td>
                  <td>{alert.customer}</td>
                  <td>
                    {alert.receivedTime}
                    <span className={styles.subText}>{formatAgo(alert.receivedMinutesAgo)}</span>
                  </td>
                  <td>
                    <span className={[styles.slaPill, isSlaUrgent(alert.slaRemaining) && styles.slaUrgent].filter(Boolean).join(' ')}>
                      {alert.slaRemaining}
                    </span>
                  </td>
                  <td className={alert.assigned ? undefined : styles.unassigned}>{alert.assigned ?? 'Unassigned'}</td>
                  <td>
                    <span className={`${styles.pill} ${statusClass[alert.status]}`}>{alert.status}</span>
                  </td>
                </tr>
              ))}
              {visibleAlerts.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>No alerts match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className={styles.tableFooter}>
          <span>
            Showing 1–{visibleAlerts.length} of {totalOpenAlerts.toLocaleString('en-US')} open alerts
          </span>
          {/* TODO: real pagination once alerts are loaded from the backend */}
          <div className={styles.pagination}>
            <Button variant="secondary" className={styles.smallButton}>Previous</Button>
            <Button variant="secondary" className={styles.smallButton}>Next</Button>
          </div>
        </footer>
      </section>

      <p className={styles.footnote}>
        SLA times are examples (Critical 1 hour, High 4 hours, Medium 8 hours, Low 24 hours) and are set per customer
        contract.
      </p>
    </>
  )
}

/* =========================
   Screen 2: alert detail
========================= */

function AlertDetailView({ alert, onBack }: { alert: Alert; onBack: () => void }) {
  const [copied, setCopied] = useState(false)
  const detail = alertDetails[alert.id]
  const payloadText = detail ? JSON.stringify(detail.rawPayload, null, 2) : ''

  const properties = [
    { label: 'Customer', value: alert.customer },
    { label: 'Assigned', value: alert.assigned ?? 'Unassigned' },
    { label: 'Received', value: `${alert.receivedTime} (${formatAgo(alert.receivedMinutesAgo)})` },
    ...(detail
      ? [
          { label: 'SLA profile', value: detail.slaProfile },
          { label: 'Retention', value: detail.retention },
        ]
      : []),
    { label: 'Priority', value: `${alert.score} of 100` },
  ]

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(payloadText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked (e.g. non-HTTPS or denied permission); fail silently for now.
    }
  }

  return (
    <>
      <button type="button" className={styles.backLink} onClick={onBack}>
        ← Back to alert queue
      </button>

      {/* Alert header */}
      <section className={styles.alertHeader} aria-labelledby="alert-title">
        <div className={styles.alertHeaderTop}>
          <div className={styles.alertMeta}>
            <span className={`${styles.pill} ${severityClass[alert.severity]}`}>{alert.severity}</span>
            <span className={`${styles.pill} ${statusClass[alert.status]}`}>{alert.status}</span>
            <span className={styles.mono}>{alert.id}</span>
            <span>{alert.customer} · source: {alert.source}</span>
          </div>
          <div className={styles.sla}>
            <span>SLA remaining</span>
            {/* TODO: make this a live countdown once the frontend is connected to the backend.
                Calculate it from the alert's SLA deadline and update it every second with useEffect + setInterval. */}
            <strong>{alert.slaRemaining}</strong>
          </div>
        </div>
        <h1 id="alert-title">{alert.title}</h1>
        {/* TODO: connect these actions to the backend */}
        <div className={styles.actions}>
          <Button>Promote to case</Button>
          <Button variant="secondary">Link to existing case</Button>
          <Button variant="secondary">Close as false positive</Button>
          <Button variant="secondary">Assign</Button>
        </div>
      </section>

      <div className={styles.columns}>
        {/* Left column */}
        <div className={styles.column}>
          {detail ? (
            <>
              <Card title="Summary" titleId="summary-title" subtitle="per OCSF, class Detection Finding (2004)">
                <dl className={styles.details}>
                  {detail.summary.map(item => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd className={item.mono ? styles.mono : undefined}>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </Card>

              <Card
                title="Observables"
                titleId="observables-title"
                subtitle={`${detail.observables.length} taken from the payload`}
                badge={<Button variant="secondary" className={`${styles.smallButton} ${styles.headerButton}`}>Add observable</Button>}
                flush
              >
                <div className={styles.tableScroll} role="region" aria-label="Observables table" tabIndex={0}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">Type</th>
                        <th scope="col">Value</th>
                        <th scope="col">Verdict</th>
                        <th scope="col">Seen before</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.observables.map(observable => (
                        <tr key={observable.value}>
                          <td>{observable.type}</td>
                          <td className={`${styles.mono} ${styles.breakValue}`}>{observable.value}</td>
                          <td>
                            <span className={`${styles.pill} ${styles[observable.verdict]}`}>
                              {verdictLabels[observable.verdict]}
                            </span>
                          </td>
                          <td>{observable.seenBefore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={styles.cardNote}>
                  Seen before only counts alerts inside this customer environment; data of other customers is never visible.
                </p>
              </Card>

              <Card
                title="Raw payload"
                titleId="payload-title"
                subtitle="OCSF, JSON"
                badge={
                  <Button variant="secondary" className={`${styles.smallButton} ${styles.headerButton}`} onClick={copyPayload}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                }
              >
                <pre className={styles.payload}>
                  <code>{payloadText}</code>
                </pre>
              </Card>
            </>
          ) : (
            <Card title="Details" titleId="details-title">
              <p className={styles.emptyText}>
                The summary, observables and raw payload for {alert.id} are not in the sample data yet. They will
                load from the backend.
              </p>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className={styles.column}>
          <Card title="Properties" titleId="properties-title">
            <dl className={styles.details}>
              {properties.map(item => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {detail && (
            <>
              <Card
                title="Related alerts"
                titleId="related-title"
                badge={<span className={styles.count}>{detail.relatedAlerts.length}</span>}
                flush
              >
                <ul className={styles.related}>
                  {detail.relatedAlerts.map(item => (
                    <li key={item.title}>
                      {/* TODO: open the related alert once it exists in the data */}
                      <a href="#">{item.title}</a>
                      <span>{item.meta}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="Activity" titleId="activity-title">
                <ol className={styles.activity}>
                  {detail.activity.map((item, index) => (
                    <li key={index}>
                      <time className={styles.mono}>{item.time}</time>
                      <p>{item.text}</p>
                    </li>
                  ))}
                </ol>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  )
}
