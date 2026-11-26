'use client'

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import Button from '../../src/components/ui/Button'
import { deleteUser, updateUser } from '../../src/services/users'
import type { User } from '../../src/types/user'

import styles from './page.module.css'

export function UserDialog({ title, children }: { title: string; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useId()

  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  return (
    <dialog ref={dialog} aria-labelledby={heading} className={`${styles.inviteModal} ${styles.userDialog}`}
      onCancel={event => event.preventDefault()}>
      <div className={styles.inviteModalHeader}>
        <h2 id={heading} className={styles.inviteModalTitle}>{title}</h2>
      </div>
      {children}
    </dialog>
  )
}

export default function UserActionDialog({ user, action, onCancel, onSaved }: {
  user: User
  action: 'edit' | 'delete'
  onCancel: () => void
  onSaved: (user: User | null) => void
}) {
  const removing = action === 'delete'
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (removing) {
        await deleteUser(user.id)
        onSaved(null)
      } else {
        const profile = { name: name.trim(), email: email.trim() }
        await updateUser(user.id, profile)
        onSaved({ ...user, ...profile })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save the change.')
      setBusy(false)
    }
  }

  return (
    <UserDialog title={removing ? `Delete ${user.name}?` : `Edit ${user.name}`}>
      <form className={styles.inviteForm} onSubmit={submit}>
        {removing ? (
          <p>This will remove <strong>{user.email}</strong> and end their access to the SOC.</p>
        ) : (
          <>
            <label className={styles.inviteField}>
              Name
              <input required maxLength={100} value={name} onChange={event => setName(event.target.value)} />
            </label>
            <label className={styles.inviteField}>
              Email
              <input required type="email" value={email} onChange={event => setEmail(event.target.value)} />
            </label>
          </>
        )}
        {error && <p role="alert">{error}</p>}
        <div className={styles.inviteActions}>
          <Button variant="secondary" autoFocus={removing} disabled={busy} onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={busy} className={removing ? styles.dangerButton : undefined}>
            {removing ? 'Delete user' : 'Save changes'}
          </Button>
        </div>
      </form>
    </UserDialog>
  )
}
