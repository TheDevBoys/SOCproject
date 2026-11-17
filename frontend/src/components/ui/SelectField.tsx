import type { SelectHTMLAttributes } from 'react'
import DropDown from './DropDown'
import styles from './TextField.module.css'

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string
  label: string
}

export default function SelectField({ id, label, children, ...props }: SelectFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <DropDown {...props} id={id} fullWidth>
        {children}
      </DropDown>
    </div>
  )
}
