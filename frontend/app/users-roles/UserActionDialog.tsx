'use client'

import { useState, type FormEvent } from 'react'
import Button from '../../src/components/ui/Button'
import { deleteUser, setUserStatus, updateUser } from '../../src/services/users'
import type { User } from '../../src/types/user'

import UserDialog from './UserDialog'
import styles from './page.module.css'

export default function UserActionDialog({ user, action, onCancel, onSaved }: {
  user: User
  action: 'edit' | 'delete' | 'status'
  onCancel: () => void
  onSaved: (user: User | null) => void
}) {
  const removing = action === 'delete'
  const changingStatus = action === 'status'
  const deactivating = user.status === 'Active'
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
      } else if (changingStatus) {
        const status = deactivating ? 'Inactive' : 'Active'
        await setUserStatus(user.id, status)
        onSaved({ ...user, status })
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
    <UserDialog title={removing ? `Delete ${user.name}?`
      : changingStatus ? `${deactivating ? 'Deactivate' : 'Reactivate'} ${user.name}?`
      : `Edit ${user.name}`} busy={busy} onClose={onCancel}>
      <form className={styles.inviteForm} onSubmit={submit}>
        {removing ? (
          <p>This will remove <strong>{user.email}</strong> and end their access to the SOC.</p>
        ) : changingStatus ? (
          <p>
            {deactivating
              ? <><strong>{user.email}</strong> will be signed out and can no longer sign in until the account is reactivated.</>
              : <><strong>{user.email}</strong> will be able to sign in again with their existing password.</>}
          </p>
        ) : (
          <>
            <label className={styles.inviteField}>
              Name
              <input className={styles.inviteInput} disabled={busy} required maxLength={100} value={name} onChange={event => setName(event.target.value)} />
            </label>
            <label className={styles.inviteField}>
              Email
              <input className={styles.inviteInput} disabled={busy} required type="email" value={email} onChange={event => setEmail(event.target.value)} />
            </label>
          </>
        )}
        {error && <p role="alert" className={styles.inviteError}>{error}</p>}
        <div className={styles.inviteActions}>
          <Button variant="secondary" autoFocus={removing || changingStatus} disabled={busy} onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={busy} className={removing ? styles.dangerButton : changingStatus && deactivating ? styles.warningButton : undefined}>
            {removing ? 'Delete user'
              : changingStatus ? (deactivating ? 'Deactivate user' : 'Reactivate user')
              : 'Save changes'}
          </Button>
        </div>
      </form>
    </UserDialog>
  )
}
