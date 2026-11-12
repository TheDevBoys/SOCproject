import styles from './page.module.css'
import CaseTable from '../../src/components/cases/CaseTable'
export const metadata = {
  title: 'Sign in | DevBoys',
}

export default function CasesPage() {
  return (
       <ul>
        <div className={styles.card}>
          <h2>Cases</h2>
          <p>Investigations created from alerts. Escalated cases wait in the right tier queue until someone picks them up. </p>

        </div>

        <div className={styles.card}>
          <h2>Alerts</h2>
          <p>Alerts are created by the SOC platform when a potential security incident is detected. </p>
        </div>

        <div className={styles.card}>
        <CaseTable />
        </div>
      </ul>
  );
}
