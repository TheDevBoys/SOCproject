import Link from 'next/link'
import Card from '../ui/Card'
import styles from './CaseTable.module.css'

const cases = [
  { id: 'CASE-2026-0147', title: 'Account compromise after phishing email', customer: 'Bank Alpha', severity: 'Critical', remaining: '00:31:07', owner: 'R. Visser (T2)' },
  { id: 'CASE-2026-0151', title: 'Unusual data export to external IP', customer: 'Energy Zeta', severity: 'Critical', remaining: '00:42:30', owner: 'Tier 2 queue' },
  { id: 'CASE-2026-0139', title: 'Suspicious sign-ins on admin portal', customer: 'Municipality Gamma', severity: 'High', remaining: '01:05:48', owner: 'S. Bakker (T1)' },
  { id: 'CASE-2026-0144', title: 'Malware detected on file server', customer: 'Bank Alpha', severity: 'High', remaining: '01:48:02', owner: 'M. Jansen (T1)' },
  { id: 'CASE-2026-0149', title: 'Backups being deleted on file server', customer: 'Care Beta', severity: 'High', remaining: '02:11:20', owner: 'Tier 2 queue' },
  { id: 'CASE-2026-0133', title: 'Suspected mailbox forwarding', customer: 'Insurer Theta', severity: 'High', remaining: '02:30:15', owner: 'L. Smit (T3)' },
]

export default function CaseTable() {
  return (
    <Card
      title="Cases at SLA risk"
      titleId="cases-at-sla-risk"
      subtitle="by remaining time"
      flush
    >
      <div className={styles.tableScroll} role="region" aria-label="Cases at SLA risk" tabIndex={0}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Case</th>
              <th scope="col">Customer</th>
              <th scope="col">Severity</th>
              <th scope="col">Remaining</th>
              <th scope="col">Owner</th>
            </tr>
          </thead>
          <tbody>
            {cases.map(item => (
              <tr key={item.id}>
                <td>
                  <Link href="/cases" className={styles.caseLink}>{item.id}</Link>
                  <span className={styles.caseTitle}>{item.title}</span>
                </td>
                <td>{item.customer}</td>
                <td>
                  <span className={[styles.pill, item.severity === 'Critical' ? styles.critical : styles.high].join(' ')}>
                    {item.severity}
                  </span>
                </td>
                <td>
                  <span className={styles.remaining}>{item.remaining}</span>
                </td>
                <td>{item.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
