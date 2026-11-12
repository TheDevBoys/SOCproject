import type { ReactNode } from 'react'
import styles from './AuthLayout.module.css'

type AuthLayoutProps = {
  title: string
  description: ReactNode
  footer: string
  children: ReactNode
}

export default function AuthLayout({ title, description, footer, children }: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <section className={styles.intro} aria-label="DevBoys SOC platform">
          <div className={styles.brand}>
            <span className={styles.brandIcon} aria-hidden="true">{'</>'}</span>
            <span><span className={styles.brandAccent}>Dev</span>Boys</span>
          </div>
          <div className={styles.pitch}>
            <h2>{title}</h2>
            {description}
          </div>
          <p className={styles.footer}>{footer}</p>
        </section>
        <div className={styles.formPanel}>{children}</div>
      </div>
    </main>
  )
}
