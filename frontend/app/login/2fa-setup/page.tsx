import AuthLayout from '../../../src/components/auth/AuthLayout'
import MfaSetupForm from '../../../src/components/auth/MfaSetupForm'
import styles from '../../../src/components/auth/AuthLayout.module.css'

export const metadata = {
  title: 'Set up two-factor authentication | DevBoys',
}

export default function Page() {
  return (
    <AuthLayout
      title="Link your authenticator app."
      description={
        <p className={styles.description}>
          Every account uses two-factor authentication. You only need to do this once.
        </p>
      }
      footer="For SOC staff only."
    >
      <MfaSetupForm />
    </AuthLayout>
  )
}
