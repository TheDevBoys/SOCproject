'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import styles from './page.module.css'

export default function UserDialog({ title, description, busy = false, onClose, children }: {
  title: string
  description?: string
  busy?: boolean
  onClose: () => void
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useId()
  const descriptionId = useId()

  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  return (
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={heading}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={event => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      onClick={event => {
        if (busy || event.target !== event.currentTarget) return

        const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect()
        if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
          onClose()
        }
      }}>
      <div className={styles.dialogHeader}>
        <div>
          <h2 id={heading} className={styles.dialogTitle}>{title}</h2>
          {description && <p id={descriptionId} className={styles.dialogDescription}>{description}</p>}
        </div>
        <button type="button" className={styles.dialogClose} aria-label="Close dialog"
          disabled={busy} onClick={onClose}>×</button>
      </div>
      {children}
    </dialog>
  )
}
