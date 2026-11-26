import DailyAlertsChart from '../../src/components/dashboard/DailyAlertsCharts';
import CaseTable from '../../src/components/dashboard/CaseTable';
import styles from '../account/page.module.css'

export const metadata = {
  title: 'Sign in | DevBoys',
}

export default function HomePage() {
  return (
    <div className={styles.dashboardShell}>
      <div className={styles.dashboardContent}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.description}>What needs attention now, sorted by SLA pressure. </p>
      <div className={styles.dashboardCards}>
       <ul>

        <div className={styles.card}>
          <h2>Open Alerts</h2>
        </div>

        <div className={styles.card}>
          <h2>Open Cases</h2>
        </div>

        <div className={styles.card}>
          <h2>SLA's at risk</h2>
        </div>

        <div className={styles.card}>
          <h2>Average run time</h2>
        </div>
        </ul>

          <div className={styles.reportOverview}> 
              <CaseTable />
              <DailyAlertsChart />
          </div>
          
      <ul>
        <div className={styles.dashboardCharts}>
          <div className={styles.card}>
            <h3>Open work per tier</h3>
            <div className={styles.chart}>
            </div>
          </div>
        </div>

        <div className={styles.dashboardCharts}>
          <div className={styles.card}>
            <h3>Open alerts by source</h3>
            <div className={styles.chart}>
            </div>
          </div>
      </div>
      </ul>
    </div>
    </div>
    </div>
  );
}