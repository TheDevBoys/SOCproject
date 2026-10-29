import AuthLayout from '../../../src/components/auth/AuthLayout'
import VerificationForm from '../../../src/components/auth/VerificationForm'
import styles from '../../../src/components/auth/AuthLayout.module.css'

export const metadata = {
  title: 'Verification code | DevBoys',
}

export default function Page() {
  return (
    <AuthLayout
      title="One more step before you are in."
      description={
        <p className={styles.description}>
          Every account uses two-factor authentication. You only get access to
          the customers linked to your role.
        </p>
      }
      footer="For SOC staff only."
    >
      <VerificationForm />
    </AuthLayout>
  )
}
