'use client'

import { useState, type SubmitEvent } from 'react'
import { useRouter } from 'next/navigation'
import TextField from '../ui/TextField'
import Button from '../ui/Button'
import AuthCard from './AuthCard'
import styles from './LoginForm.module.css'
import { login } from '../../services/auth'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login({ email, password })

      if (!result.success) {
        setError(result.message || 'Invalid email or password')
        return
      }

      router.push(result.requiresMfa ? '/login/2fa' : '/dashboard')
    } catch {
      setError('Could not reach the server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Sign in"
      titleId="login-title"
      size="compact"
      description="Use your work account. Accounts are created by an administrator."
      note="After signing in you confirm with your authenticator app."
    >
      <form onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <TextField
            id="email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="username"
            placeholder="name@organisation.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="password"
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error || undefined}
          />
        </div>
        <Button variant="primary" className={styles.submit} type="submit" loading={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        <button className={styles.forgot} type="button" onClick={() => setError('Contact your administrator if you want to reset your password.')}>
          Forgot your password?
        </button>
      </form>
    </AuthCard>
  )
}
