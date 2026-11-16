import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())

  if (items.length === 0) {
    return (
      <div>
        <EstadoVacio mensaje="No hay productos en el carrito." />
        <div className="mt-4 text-center">
          <Link to="/" className="font-medium text-orange-600 hover:underline">
            Ir al catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>
        <Card className="p-5">
          <CheckoutForm />
        </Card>
      </div>
      <div>
        <h2 className="mb-4 text-xl font-semibold">Tu pedido</h2>
        <Card className="p-5">
          <ul className="divide-y divide-stone-100 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between py-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right text-lg font-bold">Total: {formatPrecio(total)}</p>
        </Card>
      </div>
    </div>
  )
}
