import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { FieldError } from '../../../shared/components/FieldError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { useAuthStore } from '../../../store/authStore'

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const usuario = useAuthStore((s) => s.usuario)
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const from = (location.state as { from?: string } | null)?.from

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const sesion = await login(value.username, value.password)
        navigate(from ?? (sesion.role === 'admin' ? '/admin/resumen' : '/'), { replace: true })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <Card className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Iniciar sesión</h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario') }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium">Usuario</label>
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="username"
              />
              <FieldError field={field} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="current-password"
              />
              <FieldError field={field} />
            </div>
          )}
        </form.Field>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
      </form>
      <p className="mt-4 text-center text-sm text-stone-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-medium text-orange-600 hover:underline">
          Registrate
        </Link>
      </p>
    </Card>
  )
}
