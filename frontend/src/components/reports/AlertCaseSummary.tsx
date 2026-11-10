import Card from '../ui/Card'
import styles from './AlertCaseSummary.module.css'

const statistics = [
  { label: 'Alerts received', value: '312k' },
  { label: 'Closed as false positive', value: '247k' },
  { label: 'Promoted to case', value: '287' },
  { label: 'Escalated to Tier 2', value: '44' },
  { label: 'Escalated to Tier 3', value: '9' }
]

export default function AlertCaseSummary() {
  return (
    <Card title="From alert to case" titleId="alert-case-summary" flush>
      <div className={styles.content}>
        {statistics.map((statistic) => (
          <div key={statistic.label} className={styles.row}>
            <span>{statistic.label}</span>
            <strong>{statistic.value}</strong>
          </div>
        ))}

        <p className={styles.description}>
          Duplicate and informational alerts are not shown separately.
        </p>
      </div>
    </Card>
  )
}