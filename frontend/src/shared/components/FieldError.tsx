import type { AnyFieldApi } from '@tanstack/react-form'

export function FieldError({ field }: { field: AnyFieldApi }) {
  const { isTouched, errors } = field.state.meta
  if (!isTouched || errors.length === 0) return null
  return (
    <span className="mt-1 block text-xs text-red-600">
      {errors.map((e) => String(e)).join(', ')}
    </span>
  )
}
