'use client'

import { useState, type SubmitEvent } from 'react'
import { useRouter } from 'next/navigation'
import TextField from '../ui/TextField'
import Button from '../ui/Button'
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
    <section className={styles.card} aria-labelledby="login-title">
      <h2 id="login-title">Sign in</h2>
      <p className={styles.description}>Use your work account. Accounts are created by an administrator.</p>
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
        <button className={styles.register} type="button">
          No account? Register
        </button>
        <button className={styles.forgot} type="button">
          Forgot your password?
        </button>
      </form>
      <p className={styles.note}>After signing in you confirm with your authenticator app.</p>
    </section>
  )
}
