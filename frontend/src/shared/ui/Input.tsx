import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, ...props }: Props) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold">{label}</span>
      <input className="input" {...props} />
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
    </label>
  )
}
