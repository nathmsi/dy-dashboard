import type { InputHTMLAttributes } from 'react'
import styles from './SearchInput.module.css'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  id: string
}

export function SearchInput({ label, id, className, ...props }: SearchInputProps) {
  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input id={id} type="search" className={styles.input} {...props} />
    </div>
  )
}
