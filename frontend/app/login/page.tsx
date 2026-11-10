import LoginForm from '../../src/components/auth/LoginForm'
import AuthLayout from '../../src/components/auth/AuthLayout'
import styles from '../../src/components/auth/AuthLayout.module.css'

export const metadata = {
  title: 'Sign in | DevBoys',
  description: 'Sign in to the DevBoys SOC management platform.',
}

export default function Page() {
  return (
    <AuthLayout
      title="Alerts, investigations and handovers in one place."
      description={
        <ul className={styles.benefits}>
          <li>Strictly separated customer environments</li>
          <li>All data stored in the Netherlands</li>
          <li>Two-factor authentication on every account</li>
        </ul>
      }
      footer="For SOC staff only. No account? Ask an administrator."
    >
      <LoginForm />
    </AuthLayout>
  )
}
