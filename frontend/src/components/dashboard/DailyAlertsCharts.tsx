import Card from '../ui/Card'
import styles from './DailyAlertsCharts.module.css'

const alerts = [
  40, 31, 27, 24, 23, 31, 52, 68, 82, 92,
  85, 73, 59, 62, 72, 82, 70, 64, 55, 48,
  41, 35, 30, 27, 25, 22, 20, 19, 17, 15
]

export default function DailyAlertsChart() {
  return (
    <Card title="Incoming Alerts, Last 24 Hours" titleId="alerts-per-day" flush>
      <div className={styles.content}>
        <div className={styles.chart}>


          <div className={styles.plot}>

            <div className={styles.bars}>
              {alerts.map((value, index) => (
                <div
                  key={index}
                  className={[
                    styles.bar,
                    index === alerts.length - 1 && styles.highlight
                  ].filter(Boolean).join(' ')}
                  style={{ height: `${value}%` }}
                  title={`${value}k alerts`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.xAxis}>
          <span>-24 h</span>
          <span>-18 h</span>
          <span>-12 h</span>
          <span>-6 h</span>
          <span>now</span>
        </div>
        <p>
          Peak: <strong>5.1k alerts/hour</strong> · average 3.2k/hour
        </p>
      </div>
    </Card>
  )
}