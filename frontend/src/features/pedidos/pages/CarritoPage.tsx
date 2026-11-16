import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatPrecio } from '../../../shared/utils/format'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())

  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
        <EstadoVacio mensaje="Tu carrito está vacío." />
        <div className="mt-4 text-center">
          <Link to="/" className="font-medium text-orange-600 hover:underline">
            Ir al catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
      <Card className="divide-y divide-stone-100">
        {items.map((i) => (
          <div key={i.producto_id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-40 flex-1">
              <p className="font-medium">{i.nombre}</p>
              <p className="text-sm text-stone-500">{formatPrecio(i.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variante="secondary" pequeno onClick={() => cambiarCantidad(i.producto_id, i.cantidad - 1)} disabled={i.cantidad <= 1}>
                −
              </Button>
              <span className="w-8 text-center">{i.cantidad}</span>
              <Button variante="secondary" pequeno onClick={() => cambiarCantidad(i.producto_id, i.cantidad + 1)} disabled={i.cantidad >= i.stock}>
                +
              </Button>
            </div>
            <p className="w-28 text-right font-semibold">{formatPrecio(i.precio_unitario * i.cantidad)}</p>
            <Button variante="ghost" pequeno onClick={() => quitar(i.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button variante="secondary" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-xl font-bold">Total: {formatPrecio(total)}</p>
          <Link to="/checkout">
            <Button>Continuar al checkout</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
