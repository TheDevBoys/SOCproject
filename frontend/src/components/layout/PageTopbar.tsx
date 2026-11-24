'use client'

import styles from './PageTopbar.module.css'
import { useAuth } from '../auth/AuthProvider'

type PageTopbarProps = {
  title: string
  userName: string
  userRole: string
  twoFactorEnabled: boolean
  sampleData?: boolean
}

export default function PageTopbar({
  title,
  userName,
  userRole,
  twoFactorEnabled,
  sampleData = false,
}: PageTopbarProps) {
  const { user, logout } = useAuth()

  const name = user?.name ?? userName
  const role = user?.role ?? userRole
  const mfa = user?.mfaEnabled ?? twoFactorEnabled

  return (
    <header className={styles.topbar}>
      <p>{title}</p>
      <div className={styles.badges}>{sampleData && <span>Sample data</span>}
        <span>{name} - {role} - {mfa ? ' 2FA on' : ' 2FA off'}</span>
        {user && (
          <button type="button" className={styles.logout} onClick={logout}>
            Sign out
          </button>
        )}
      </div>
    </header>
  )
}
