import Link from 'next/link'
import Button from '../ui/Button'
import styles from './VerificationForm.module.css'

export default function VerificationForm() {
  return (
    <section className={styles.card} aria-labelledby="verification-title">
      <h1 id="verification-title">Verification code</h1>
      <p id="verification-description" className={styles.description}>
        Open your authenticator app and enter the 6-digit code.
      </p>
      <div>
        <div
          className={styles.digits}
          role="group"
          aria-label="6-digit verification code"
          aria-describedby="verification-description"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <input
              key={index}
              className={styles.digit}
              type="text"
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>
        <Button type="button" className={styles.verify}>Verify</Button>
        <div className={styles.actions}>
          <button type="button">Use a recovery code</button>
          <Link href="/login">Back to sign in</Link>
        </div>
      </div>
      <p className={styles.note}>Too many failed attempts lock the account for a while. Every failed attempt is written to the audit log.</p>
    </section>
  )
}
