import type { ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = {
  title: string
  titleId: string
  badge?: ReactNode
  children: ReactNode
  className?: string
  flush?: boolean
}

export default function Card({ title, titleId, badge, children, className, flush = false }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')} aria-labelledby={titleId}>
      <header className={styles.header}>
        <h2 id={titleId}>{title}</h2>
        {badge}
      </header>
      <div className={flush ? undefined : styles.body}>{children}</div>
    </section>
  )
}
