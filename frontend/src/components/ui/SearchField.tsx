import type { ComponentProps } from 'react'
import TextField from './TextField'

type SearchFieldProps = Omit<ComponentProps<typeof TextField>, 'type'>

export default function SearchField(props: SearchFieldProps) {
  return (
    <TextField
      {...props}
      type="search"
      placeholder={props.placeholder ?? 'Search...'}
      aria-label={props['aria-label'] ?? 'Search'}
    />
  )
}