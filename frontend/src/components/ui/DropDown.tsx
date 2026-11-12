import type { SelectHTMLAttributes } from 'react'
import styles from './DropDown.module.css'

type DropDownProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string
  label?: string
  error?: string
  containerClassName?: string
  fullWidth?: boolean
  loading?: boolean
}

export default function DropDown({
  id,
  label,
  className,
  containerClassName,
  error,
  fullWidth = false,
  loading = false,
  disabled,
  children,
  ...props
}: DropDownProps) {
  return (
    <div className={[styles.field, containerClassName].filter(Boolean).join(' ')}>
      {label && (<label className={styles.label} htmlFor={id}>{label}</label>)}
      <select
        {...props}
        id={id}
        disabled={disabled || loading}
        className={[styles.dropDown, fullWidth && styles.fullWidth, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={
          [props['aria-describedby'], error ? `${id}-error` : undefined]
            .filter(Boolean)
            .join(' ') || undefined
        }
      >
        {children}
      </select>
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}