'use client'

import type { ClipboardEvent, KeyboardEvent, RefObject } from 'react'
import styles from './CodeInput.module.css'

export const CODE_LENGTH = 6

export const emptyCode = () => Array<string>(CODE_LENGTH).fill('')

type CodeInputProps = {
  digits: string[]
  onChange: (digits: string[]) => void
  inputsRef: RefObject<(HTMLInputElement | null)[]>
  describedBy?: string
  disabled?: boolean
}

export default function CodeInput({ digits, onChange, inputsRef, describedBy, disabled }: CodeInputProps) {
  function setDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    onChange(digits.map((d, i) => (i === index ? digit : d)))

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return

    event.preventDefault()
    onChange(Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? ''))
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  return (
    <div
      className={styles.digits}
      role="group"
      aria-label="6-digit verification code"
      aria-describedby={describedBy}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={element => { inputsRef.current[index] = element }}
          className={styles.digit}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={e => setDigit(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
