'use client'

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type SubmitEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '../ui/Button'
import styles from './VerificationForm.module.css'
import { getMfaSetup, verifyMfa } from '../../services/auth'
import type { MfaSetup } from '../../types/auth'

const CODE_LENGTH = 6

export default function VerificationForm() {
  const router = useRouter()
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [setup, setSetup] = useState<MfaSetup | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMfaSetup()
      .then(result => {
        if (!result) {
          router.replace('/login')
          return
        }
        setSetup(result)
        inputs.current[0]?.focus()
      })
      .catch(() => setError('Could not reach the server. Please try again later.'))
  }, [router])

  function setDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    setDigits(current => current.map((d, i) => (i === index ? digit : d)))

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return

    event.preventDefault()
    setDigits(Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? ''))
    inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = digits.join('')

    if (code.length !== CODE_LENGTH) {
      setError('Enter all 6 digits.')
      return
    }

    setError('')
    setLoading(true)

    try {
      if (await verifyMfa(code)) {
        router.push('/dashboard')
        return
      }

      setError('Invalid or expired code. Try the newest code in your app.')
      setDigits(Array(CODE_LENGTH).fill(''))
      inputs.current[0]?.focus()
    } catch {
      setError('Could not reach the server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.card} aria-labelledby="verification-title">
      <h1 id="verification-title">Verification code</h1>

      {setup?.setupRequired ? (
        <div className={styles.setup}>
          <p className={styles.description}>
            First time? Link your authenticator app (Microsoft or Google Authenticator):
            choose <strong>Enter a setup key</strong> and type this key.
          </p>
          <code className={styles.secret}>{setup.secret.match(/.{1,4}/g)?.join(' ')}</code>
          <a className={styles.setupLink} href={setup.qrCodeUri}>
            On your phone? Open in authenticator app
          </a>
        </div>
      ) : null}

      <p id="verification-description" className={styles.description}>
        Open your authenticator app and enter the 6-digit code.
      </p>
      <form onSubmit={handleSubmit}>
        <div
          className={styles.digits}
          role="group"
          aria-label="6-digit verification code"
          aria-describedby="verification-description"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={element => { inputs.current[index] = element }}
              className={styles.digit}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              onChange={e => setDigit(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <Button variant="primary" type="submit" className={styles.verify} loading={loading}>
          {loading ? 'Verifying…' : 'Verify'}
        </Button>
        <div className={styles.actions}>
          <button type="button">Use a recovery code</button>
          <Link href="/login">Back to sign in</Link>
        </div>
      </form>
      <p className={styles.note}>Too many failed attempts lock the account for a while. Every failed attempt is written to the audit log.</p>
    </section>
  )
}
