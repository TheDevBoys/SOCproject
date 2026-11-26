'use client'

import { useAuth } from '../../src/components/auth/AuthProvider'
import TextField from '../../src/components/ui/TextField'
import { roleLabel } from '../../src/types/roleLabels'
import styles from './page.module.css'

export default function AccountProfile() {
  const { user } = useAuth()

  if (!user) return null

  const role = roleLabel(user.role)
  const initials = user.name.trim().split(/\s+/).slice(0, 2)
    .map(part => Array.from(part)[0] ?? '').join('').toUpperCase()
  const customerAccess = user.customerAccessCount === 1 ? '1 customer' : `${user.customerAccessCount} customers`

  return (
    <div className={styles.content}>
      <section className={styles.profile} aria-labelledby="profile-name">
        <div className={styles.avatar}><span aria-hidden="true">{initials}</span></div>
        <div>
          <h2 id="profile-name">{user.name}</h2>
          <p>{user.email}</p>
          <span className={styles.role}>{role}</span>
        </div>
      </section>
      <section className={styles.card} aria-labelledby="general-title">
        <h2 id="general-title">General information</h2>
        <div className={styles.cardBody}>
          <div className={styles.fields}>
            <TextField id="account-name" label="Name" value={user.name} readOnly className={styles.readOnly} />
            <TextField id="account-email" label="Email address" type="email" value={user.email} readOnly className={styles.readOnly} />
            <TextField id="account-role" label="Role" value={role} readOnly className={styles.readOnly} />
            <TextField id="account-access" label="Customer access" value={customerAccess} readOnly className={styles.readOnly} />
          </div>
          <p className={styles.help}>Your role and customer access are managed by a superuser.</p>
        </div>
      </section>
    </div>
  )
}
