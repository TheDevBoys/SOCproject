import DailyAlertsChart from '../../src/components/dashboard/DailyAlertsCharts';
import CaseTable from '../../src/components/dashboard/CaseTable';
import styles from './page.module.css'

export const metadata = {
  title: 'Sign in | DevBoys',
}

export default function HomePage() {
  return (
    <div className={styles.dashboardContent}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.description}>What needs attention now, sorted by SLA pressure.</p>

      <div className={styles.dashboardCards}>
        <section className={styles.metricCard}>
          <h2>Open Alerts</h2>
          <strong>12,480</strong>
          <p>4,212 received in the last hour</p>
        </section>

        <section className={styles.metricCard}>
          <h2>Open Cases</h2>
          <strong>47</strong>
          <p>9 waiting for the customer</p>
        </section>

        <section className={styles.metricCard}>
          <h2>SLA's at risk</h2>
          <strong className={styles.riskValue}>2</strong>
          <p>within 1 hour</p>
        </section>

        <section className={styles.metricCard}>
          <h2>Average run time</h2>
          <strong>06:12</strong>
          <p>min:sec; last 24 hours</p>
        </section>
      </div>

      <div className={styles.reportOverview}>
        <CaseTable />
        <DailyAlertsChart />
      </div>

      <div className={styles.dashboardCharts}>
        <section className={styles.card}>
          <h3>Open work per tier</h3>
          <div className={styles.chart} />
        </section>

        <section className={styles.card}>
          <h3>Open alerts by source</h3>
          <div className={styles.chart} />
        </section>
      </div>
    </div>
  );
}