import { Suspense } from 'react'
import AuthLayout from '../../../src/components/auth/AuthLayout'
import AcceptInvitationForm from '../../../src/components/auth/AcceptInvitationForm'
import styles from '../../../src/components/auth/AuthLayout.module.css'

export const metadata = {
  title: 'Activate your account | DevBoys',
}

export default function Page() {
  return (
    <AuthLayout
      title="Welcome to the team."
      description={
        <p className={styles.description}>
          You were invited to the DevBoys SOC platform. Set a password to activate your account.
        </p>
      }
      footer="For SOC staff only."
    >
      {/* useSearchParams (for the token) needs a Suspense boundary in the App Router. */}
      <Suspense fallback={null}>
        <AcceptInvitationForm />
      </Suspense>
    </AuthLayout>
  )
}
