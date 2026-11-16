import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { FieldError } from '../../../shared/components/FieldError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { useAuthStore } from '../../../store/authStore'
import { registerRequest } from '../api/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await registerRequest(value)
        await login(value.username, value.password)
        navigate('/', { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  const campos = [
    { name: 'username', label: 'Usuario', type: 'text', min: 3, auto: 'username' },
    { name: 'full_name', label: 'Nombre completo', type: 'text', min: 1, auto: 'name' },
    { name: 'email', label: 'Email', type: 'email', min: 0, auto: 'email' },
    { name: 'password', label: 'Contraseña (mínimo 8 caracteres)', type: 'password', min: 8, auto: 'new-password' },
  ] as const

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Crear cuenta</h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        {campos.map((c) => (
          <form.Field
            key={c.name}
            name={c.name}
            validators={{
              onChange: ({ value }) => {
                if (!value.trim()) return 'Campo obligatorio'
                if (c.name === 'email' && !EMAIL_RE.test(value)) return 'Email inválido'
                if (c.min > 1 && value.length < c.min) return `Mínimo ${c.min} caracteres`
                return undefined
              },
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium">{c.label}</label>
                <input
                  type={c.type}
                  autoComplete={c.auto}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>
        ))}
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Registrarme'}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-orange-600 hover:underline">
          Ingresá
        </Link>
      </p>
    </Card>
  )
}
