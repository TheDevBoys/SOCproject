import styles from './PageTopbar.module.css'

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
  return (
    <header className={styles.topbar}>
      <p>{title}</p>
      <div className={styles.badges}>{sampleData && <span>Sample data</span>}
        <span>{userName} - {userRole} - {twoFactorEnabled ? ' 2FA on' : ' 2FA off'}</span>
      </div>
    </header>
  )
}