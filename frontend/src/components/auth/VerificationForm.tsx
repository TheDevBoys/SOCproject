'use client'

import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '../ui/Button'
import AuthCard from './AuthCard'
import CodeInput, { CODE_LENGTH, emptyCode } from './CodeInput'
import FormError from './FormError'
import styles from './VerificationForm.module.css'
import { getMfaSetup, verifyMfa } from '../../services/auth'

export default function VerificationForm() {
  const router = useRouter()
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const [digits, setDigits] = useState<string[]>(emptyCode)
  const [ready, setReady] = useState(false)
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

        if (result.setupRequired) {
          router.replace('/login/2fa-setup')
          return
        }

        setReady(true)
      })
      .catch(() => {
        if (active) setError('Could not reach the server. Please try again later.')
      })

    return () => { active = false }
  }, [router])

  useEffect(() => {
    if (ready) inputs.current[0]?.focus()
  }, [ready])

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
    <AuthCard
      title="Verification code"
      titleId="verification-title"
      description="Open your authenticator app and enter the 6-digit code."
      descriptionId="verification-description"
      note="Too many failed attempts lock the account for a while. Every failed attempt is written to the audit log."
    >
      <form onSubmit={handleSubmit}>
        <CodeInput
          digits={digits}
          onChange={next => { setDigits(next); setError('') }}
          inputsRef={inputs}
          describedBy="verification-description"
          disabled={!ready}
        />
        <FormError message={error} />
        <Button variant="primary" type="submit" className={styles.verify} loading={loading} disabled={!ready}>
          {loading ? 'Verifying…' : 'Verify'}
        </Button>
        <div className={styles.actions}>
          <button type="button">Don't have the code anymore? Contact your administrator</button>
          <Link href="/login">Back to sign in</Link>
        </div>
      </form>
    </AuthCard>
  )
}
