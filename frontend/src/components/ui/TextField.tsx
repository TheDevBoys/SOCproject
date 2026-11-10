import type { InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  containerClassName?: string
}

export default function TextField({
  id,
  label,
  type = 'text',
  className,
  containerClassName,
  error,
  ...props
}: TextFieldProps) {
  return (
    <div className={[styles.field, containerClassName].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        type={type}
        className={[styles.input, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={
          [props['aria-describedby'], error ? `${id}-error` : undefined]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
