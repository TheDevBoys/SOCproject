'use client'

import { useEffect, useState, type SubmitEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import TextField from '../ui/TextField'
import Button from '../ui/Button'
import AuthCard from './AuthCard'
import FormError from './FormError'
import styles from './AcceptInvitationForm.module.css'
import { acceptInvitation, validateInvitation } from '../../services/invitation'
import type { ValidateInvitationResponse } from '../../types/invitation'

const MIN_PASSWORD_LENGTH = 12

type State =
  | { status: 'checking' }
  | { status: 'invalid'; message: string }
  | { status: 'ready'; invitation: ValidateInvitationResponse }

export default function AcceptInvitationForm() {
  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''

  const [state, setState] = useState<State>({ status: 'checking' })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setState({ status: 'invalid', message: 'This invitation link is incomplete. Open the link from your email again.' })
      return
    }

    let active = true

    validateInvitation(token)
      .then(invitation => {
        if (active) setState({ status: 'ready', invitation })
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            status: 'invalid',
            message: err instanceof Error ? err.message : 'This invitation is invalid, expired or already used.',
          })
        }
      })

    return () => { active = false }
  }, [token])

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`)
      return
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await acceptInvitation({ token, password })
      router.replace('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not activate your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (state.status === 'checking') {
    return (
      <AuthCard title="Activate your account" titleId="invite-title">
        <p className={styles.text}>Checking your invitation…</p>
      </AuthCard>
    )
  }

  if (state.status === 'invalid') {
    return (
      <AuthCard title="Invitation not valid" titleId="invite-title">
        <FormError message={state.message} />
        <p className={styles.text}>Ask an administrator to send you a new invitation.</p>
        <Link href="/login" className={styles.link}>Back to sign in</Link>
      </AuthCard>
    )
  }

  const { invitation } = state

  return (
    <AuthCard
      title="Activate your account"
      titleId="invite-title"
      description={<>Welcome, {invitation.name}. Choose a password for <strong>{invitation.email}</strong>.</>}
      note="After this you sign in and link your authenticator app."
    >
      <form onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <TextField
            id="invite-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
          />
          <TextField
            id="invite-password-confirm"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); setError('') }}
          />
        </div>
        <FormError message={error} />
        <Button variant="primary" type="submit" className={styles.submit} loading={loading}>
          {loading ? 'Activating…' : 'Activate account'}
        </Button>
      </form>
    </AuthCard>
  )
}
