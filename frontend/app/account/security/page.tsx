import Button from '../../../src/components/ui/Button'
import Card from '../../../src/components/ui/Card'
import TextField from '../../../src/components/ui/TextField'
import styles from './page.module.css'

export const metadata = {
  title: 'Security | DevBoys',
}

const sessions = [
  { device: 'Windows, Chrome', location: 'Netherlands', lastActive: 'now (this session)', current: true },
  { device: 'Windows, Edge', location: 'Netherlands', lastActive: 'yesterday 17:52', current: false },
  { device: 'Android, app', location: 'Netherlands', lastActive: '03-10 21:14', current: false },
]

export default function SecurityPage() {
  return (
    <div className={styles.grid}>
      <Card title="Change password" titleId="password-title">
        <div className={styles.passwordFields}>
          <TextField id="current-password" label="Current password" type="password" autoComplete="current-password" />
          <TextField id="new-password" label="New password" type="password" autoComplete="new-password" />
          <TextField id="repeat-password" label="Repeat new password" type="password" autoComplete="new-password" />
        </div>
        <Button variant="primary" type="button" className={styles.save} aria-disabled="true">Save password</Button>
      </Card>
      <div className={styles.column}>
        <Card title="Two-factor authentication" titleId="two-factor-title" badge={<span className={styles.badge}>Active</span>}>
          <dl className={styles.details}>
            <div><dt>Method</dt><dd>Authenticator app</dd></div>
            <div><dt>Set up on</dt><dd>02-09-2026</dd></div>
            <div><dt>Recovery codes</dt><dd>8 of 10 left</dd></div>
          </dl>
          <div className={styles.actions}>
            <Button variant="secondary" type="button" aria-disabled="true">Set up again</Button>
            <Button variant="secondary" type="button" aria-disabled="true">Generate new recovery codes</Button>
          </div>
          <p className={styles.note}>Two-factor authentication cannot be turned off. If you lose your phone, a superuser helps you link a new one.</p>
        </Card>
        <Card title="Active sessions" titleId="sessions-title" flush>
          <div className={styles.tableScroll} role="region" aria-label="Active sessions table" tabIndex={0}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Device</th>
                  <th scope="col">Location</th>
                  <th scope="col">Last active</th>
                  <th scope="col"><span className={styles.visuallyHidden}>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.device}>
                    <td>{session.device}</td>
                    <td>{session.location}</td>
                    <td>{session.lastActive}</td>
                    <td>{!session.current && <button type="button" className={styles.signOut} aria-disabled="true" aria-label={`Sign out ${session.device}`}>Sign out</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
