import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { FieldError } from '../../../shared/components/FieldError'
import { Button } from '../../../shared/ui/Button'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types'

export function CheckoutForm() {
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const crear = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await crear.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        })
        vaciar()
        navigate('/mis-pedidos')
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const n = value.trim().length
            return n < 5 || n > 200 ? 'La dirección debe tener entre 5 y 200 caracteres' : undefined
          },
        }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium">Dirección de entrega</label>
            <input
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError field={field} />
          </div>
        )}
      </form.Field>
      <form.Field name="forma_pago">
        {(field) => (
          <div>
            <label className="block text-sm font-medium">Forma de pago</label>
            <select
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value as FormaPago)}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
        )}
      </form.Field>
      <form.Field name="notas">
        {(field) => (
          <div>
            <label className="block text-sm font-medium">Notas (opcional)</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="w-full" disabled={isSubmitting || items.length === 0}>
            {isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
