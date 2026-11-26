'use client'

import { useState } from 'react'
import Sidebar from '../../src/components/layout/Sidebar'
import PageTopbar from '../../src/components/layout/PageTopbar'
import Button from '../../src/components/ui/Button'
import Card from '../../src/components/ui/Card'
import styles from './page.module.css'

/* =========================
   Sample data (replace with API data later)
========================= */

type Verdict = 'malicious' | 'internal' | 'suspicious'

type Observable = {
  type: string
  value: string
  verdict: Verdict
  seenBefore: string
}

const alert = {
  id: 'ALR-884213',
  severity: 'Critical',
  status: 'In triage',
  customer: 'Bank Alpha',
  source: 'EDR',
  title: 'Ransomware behaviour: mass file encryption',
  slaRemaining: '00:18:42',
}

const summary: { label: string; value: string; mono?: boolean }[] = [
  { label: 'Title', value: 'Ransomware behaviour: mass file encryption' },
  { label: 'Time', value: '2026-10-06 09:41:12 (UTC+2)', mono: true },
  { label: 'Severity', value: 'Critical (severity_id 5)' },
  { label: 'Device', value: 'BA-WKS-0412 · 10.20.4.112', mono: true },
  { label: 'User', value: 'b.devries@bankalpha.example', mono: true },
  { label: 'Process', value: 'svchost_upd.exe (parent: winword.exe)', mono: true },
  { label: 'Detection', value: 'More than 1,800 files renamed and encrypted in 90 seconds' },
  { label: 'Source', value: 'EDR agent, product name from metadata.product.name' },
]

const observables: Observable[] = [
  {
    type: 'Hash (SHA-256)',
    value: '9f2c4b7e1a03d5c8b6e24f90a7d1c3e5b8f2a4d6c0e91735ab4cd2e8f6e41a',
    verdict: 'malicious',
    seenBefore: '2 alerts, last 14 days',
  },
  { type: 'IP address', value: '10.20.4.112', verdict: 'internal', seenBefore: '5 alerts, last 30 days' },
  { type: 'File name', value: 'svchost_upd.exe', verdict: 'suspicious', seenBefore: 'Not seen before' },
]

const verdictLabels: Record<Verdict, string> = {
  malicious: 'Malicious',
  internal: 'Internal',
  suspicious: 'Suspicious',
}

const properties = [
  { label: 'Customer', value: 'Bank Alpha' },
  { label: 'Assigned', value: 'M. Jansen (Tier 1)' },
  { label: 'Received', value: '09:41 (41 min ago)' },
  { label: 'SLA profile', value: 'Premium 24/7' },
  { label: 'Retention', value: '30 days after closing' },
  { label: 'Priority', value: '98 of 100' },
]

const relatedAlerts = [
  { title: 'Suspicious macro run in winword.exe', meta: 'Same device, 6 minutes earlier' },
  { title: 'Unusual SMB connections from BA-WKS-0412', meta: 'Same device, 5 minutes later' },
  { title: 'Phishing email with attachment received by b.devries', meta: 'Same user, 38 minutes earlier' },
]

const activity = [
  { time: '10:02', text: 'M. Jansen picked up the alert (status: in triage).' },
  { time: '09:41', text: 'Alert received through the API and linked to Bank Alpha.' },
  { time: '09:41', text: 'SLA clock started: critical, 1 hour to contain.' },
]

const rawPayload = {
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
}

const payloadText = JSON.stringify(rawPayload, null, 2)

/* =========================
   Page
========================= */

export default function AlertQueuePage() {
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)

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
    <div className={[styles.shell, collapsed && styles.collapsedShell].filter(Boolean).join(' ')}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />
      <div className={styles.workspace}>
        <PageTopbar title={`Alert queue / ${alert.id}`} userName="M. Jansen" userRole="Tier 1" twoFactorEnabled={true} sampleData={true} />
        <main className={styles.main}>
          {/* Alert header */}
          <section className={styles.alertHeader} aria-labelledby="alert-title">
            <div className={styles.alertHeaderTop}>
              <div className={styles.alertMeta}>
                <span className={`${styles.pill} ${styles.critical}`}>{alert.severity}</span>
                <span className={`${styles.pill} ${styles.triage}`}>{alert.status}</span>
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
              <Card title="Summary" titleId="summary-title" subtitle="per OCSF, class Detection Finding (2004)">
                <dl className={styles.details}>
                  {summary.map(item => (
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
                subtitle={`${observables.length} taken from the payload`}
                badge={<Button variant="secondary" className={styles.headerButton}>Add observable</Button>}
                className={styles.cardWithAction}
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
                      {observables.map(observable => (
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
                  <Button variant="secondary" className={styles.headerButton} onClick={copyPayload} aria-live="polite">
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                }
                className={styles.cardWithAction}
              >
                <pre className={styles.payload}>
                  <code>{payloadText}</code>
                </pre>
              </Card>
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

              <Card
                title="Related alerts"
                titleId="related-title"
                badge={<span className={styles.count}>{relatedAlerts.length}</span>}
                flush
              >
                <ul className={styles.related}>
                  {relatedAlerts.map(item => (
                    <li key={item.title}>
                      {/* TODO: link to the related alert once alert detail routes exist */}
                      <a href="#">{item.title}</a>
                      <span>{item.meta}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card title="Activity" titleId="activity-title">
                <ol className={styles.activity}>
                  {activity.map((item, index) => (
                    <li key={index}>
                      <time className={styles.mono}>{item.time}</time>
                      <p>{item.text}</p>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
