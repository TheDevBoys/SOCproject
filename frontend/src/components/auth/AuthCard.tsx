import type { ReactNode } from 'react'
import styles from './AuthCard.module.css'

type AuthCardProps = {
  title: string
  titleId: string
  description?: ReactNode
  /** Lets inputs point at the description with aria-describedby. */
  descriptionId?: string
  note?: ReactNode
  /** 'compact' is the narrower card used by the sign-in form. */
  size?: 'default' | 'compact'
  children: ReactNode
}

export default function AuthCard({
  title,
  titleId,
  description,
  descriptionId,
  note,
  size = 'default',
  children,
}: AuthCardProps) {
  return (
    <section
      className={[styles.card, size === 'compact' && styles.compact].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
    >
      <h1 id={titleId}>{title}</h1>
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
      {children}
      {note && <p className={styles.note}>{note}</p>}
    </section>
  )
}
