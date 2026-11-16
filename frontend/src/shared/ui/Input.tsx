import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <label className="block text-sm" htmlFor={id}>
      {label && <span className="mb-1 block font-medium text-stone-700">{label}</span>}
      <input
        id={id}
        {...props}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 ${
          error ? 'border-red-400' : 'border-stone-300'
        } ${className}`}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
