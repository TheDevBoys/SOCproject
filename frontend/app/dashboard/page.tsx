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
      </div>
      </div>
    </div>
  );
}