'use client'

import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import Button from '../ui/Button'
import AuthCard from './AuthCard'
import CodeInput, { CODE_LENGTH, emptyCode } from './CodeInput'
import FormError from './FormError'
import styles from './MfaSetupForm.module.css'
import { getMfaSetup, verifyMfa } from '../../services/auth'
import type { MfaSetup } from '../../types/auth'

export default function MfaSetupForm() {
  const router = useRouter()
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const [setup, setSetup] = useState<MfaSetup | null>(null)
  const [digits, setDigits] = useState<string[]>(emptyCode)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    getMfaSetup()
      .then(result => {
        if (!active) return

        if (!result) {
          router.replace('/login')
          return
        }

        if (!result.setupRequired) {
          router.replace('/login/2fa')
          return
        }

        setSetup(result)
      })
      .catch(() => {
        if (active) setError('Could not load the two-factor setup. Please try again later.')
      })

    return () => { active = false }
  }, [router])

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
        router.replace('/dashboard')
        return
      }

      setError('Invalid or expired code. Try the newest code in your app.')
      setDigits(emptyCode())
      inputs.current[0]?.focus()
    } catch {
      setError('Could not reach the server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Set up two-factor authentication" titleId="mfa-setup-title">
      {setup ? (
        <>
          <div className={styles.setup}>
            <p className={styles.setupText}>
              Scan this QR code with Microsoft Authenticator or Google Authenticator.
            </p>
            <QRCodeSVG value={setup.qrCodeUri} size={180} className={styles.qr} />
            <details>
              <summary className={styles.setupToggle}>Can&apos;t scan the QR code?</summary>
              <div className={styles.manual}>
                <p className={styles.setupText}>
                  Choose <strong>Enter a setup key</strong> in your app and type this key:
                </p>
                <code className={styles.secret}>{setup.secret.match(/.{1,4}/g)?.join(' ')}</code>
                <a className={styles.setupLink} href={setup.qrCodeUri}>
                  On your phone? Open in authenticator app
                </a>
              </div>
            </details>
          </div>

          <p id="mfa-setup-description" className={styles.instructions}>
            Then enter the 6-digit code your app shows to activate two-factor authentication.
          </p>
          <form onSubmit={handleSubmit}>
            <CodeInput
              digits={digits}
              onChange={next => { setDigits(next); setError('') }}
              inputsRef={inputs}
              describedBy="mfa-setup-description"
            />
            <FormError message={error} />
            <Button variant="primary" type="submit" className={styles.submit} loading={loading}>
              {loading ? 'Verifying…' : 'Activate 2FA'}
            </Button>
          </form>
        </>
      ) : error ? (
        <FormError message={error} />
      ) : (
        <p className={styles.instructions}>Loading two-factor setup…</p>
      )}

      <Link href="/login" className={styles.backLink}>Back to sign in</Link>
    </AuthCard>
  )
}
