"use client"

import {
  useState,
  useRef,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
  ClipboardEvent,
} from "react"
import { cn } from "@/lib/utils"

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export default function CodeInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  className,
  autoFocus = false,
}: CodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.split("").slice(0, length)
  while (digits.length < length) {
    digits.push("")
  }

  const focusInput = useCallback((index: number) => {
    const input = inputRefs.current[index]
    if (input) {
      input.focus()
      setFocusedIndex(index)
    }
  }, [])

  const applyClipboardValue = (rawValue: string) => {
    const sanitized = rawValue.replace(/\D/g, "").slice(0, length)
    const newDigits = new Array(length).fill("")

    for (let i = 0; i < sanitized.length; i++) {
      newDigits[i] = sanitized[i]
    }

    onChange(newDigits.join(""))

    const nextIndex = sanitized.length === 0 ? 0 : Math.min(sanitized.length, length - 1)
    setTimeout(() => focusInput(nextIndex), 0)
  }

  const handleInputChange = (index: number, newValue: string) => {
    if (disabled) return

    // Handle bulk input (e.g. paste, auto-fill) by seeding from the first field
    if (newValue.length > 1) {
      applyClipboardValue(newValue)
      return
    }

    // Handle single character input
    if (/^\d*$/.test(newValue)) {
      const newDigits = [...digits]
      newDigits[index] = newValue
      onChange(newDigits.join(""))

      // Auto-advance to next input
      if (newValue && index < length - 1) {
        setTimeout(() => focusInput(index + 1), 0)
      }
    }
  }

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return

    event.preventDefault()
    applyClipboardValue(event.clipboardData.getData("text"))
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Move to previous input if current is empty
      setTimeout(() => focusInput(index - 1), 0)
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault()
      focusInput(index - 1)
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault()
      focusInput(index + 1)
    }
  }

  const handleFocus = (index: number) => {
    setFocusedIndex(index)
  }

  const handleBlur = () => {
    setFocusedIndex(null)
  }

  return (
    <div className={cn("grid w-full grid-cols-6 gap-2", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleInputChange(index, e.target.value)
          }
          onPaste={(event: ClipboardEvent<HTMLInputElement>) =>
            handlePaste(index, event)
          }
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            "h-12 w-full min-w-0 text-center text-lg font-semibold rounded-lg border border-gray-300 focus:border-red-500 focus:ring-0 focus:outline-none transition-colors",
            digit && "border-gray-400 bg-gray-50",
            focusedIndex === index && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  )
}
