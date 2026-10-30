import TextField from '../ui/TextField'
import Button from '../ui/Button'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  return (
    <section className={styles.card} aria-labelledby="login-title">
      <h2 id="login-title">Sign in</h2>
      <p className={styles.description}>Use your work account. Accounts are created by an administrator.</p>
      <div>
        <div className={styles.fields}>
          <TextField id="email" name="email" label="Email address" type="email" autoComplete="username" placeholder="name@organisation.com" required />
          <TextField id="password" name="password" label="Password" type="password" autoComplete="current-password" placeholder="Password" required />
        </div>
        <Button variant="primary" className={styles.submit} type="button">Sign in</Button>
        <button className={styles.forgot} type="button">
          Forgot your password?
        </button>
      </div>
      <p className={styles.note}>After signing in you confirm with your authenticator app.</p>
    </section>
  )
}
