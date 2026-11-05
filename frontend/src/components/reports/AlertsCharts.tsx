import Card from '../ui/Card'
import styles from './AlertsCharts.module.css'

const alerts = [
  10.2, 10.7, 10.9, 10.5, 10.1, 8.0, 7.6,
  10.4, 10.8, 11.0, 10.7, 10.2, 8.1, 7.7,
  10.5, 13.1, 12.0, 11.0, 10.5, 8.0, 7.7,
  10.7, 10.9, 11.2, 10.8, 10.2, 8.2, 7.8,
  10.6, 10.1
]

export default function AlertsChart() {
  return (
    <Card title="Alerts per day" titleId="alerts-per-day" flush>
      <div className={styles.content}>
        <div className={styles.chart}>
          <div className={styles.yAxis}>
            <span>15k</span>
            <span>7.5k</span>
            <span>0</span>
          </div>

          <div className={styles.plot}>
            <div className={styles.gridLines}>
              <span />
              <span />
              <span />
            </div>

            <div className={styles.bars}>
              {alerts.map((value, index) => (
                <div
                  key={index}
                  className={[
                    styles.bar,
                    index === 15 && styles.highlight
                  ].filter(Boolean).join(' ')}
                  style={{ height: `${(value / 15) * 100}%` }}
                  title={`${value}k alerts`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.xAxis}>
          <span>7 Sep</span>
          <span>14 Sep</span>
          <span>21 Sep</span>
          <span>28 Sep</span>
          <span>6 Oct</span>
        </div>

        <p className={styles.description}>
          Peak on 22 September: <strong>13.1k alerts</strong> caused by a
          phishing campaign; weekends sit around 8k.
        </p>
      </div>
    </Card>
  )
}