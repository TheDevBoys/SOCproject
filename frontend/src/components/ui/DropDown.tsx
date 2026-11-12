import type { SelectHTMLAttributes } from 'react'
import styles from './DropDown.module.css'

type DropDownProps = SelectHTMLAttributes<HTMLSelectElement> & {
  fullWidth?: boolean
  loading?: boolean
}

export default function DropDown({
  className,
  fullWidth = false,
  loading = false,
  disabled,
  children,
  ...props
}: DropDownProps) {
  return (
    <select
      {...props}
      className={[
        styles.dropDown,
        fullWidth && styles.fullWidth,
        className
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || props['aria-busy']}
    >
      {children}
    </select>
  )
}