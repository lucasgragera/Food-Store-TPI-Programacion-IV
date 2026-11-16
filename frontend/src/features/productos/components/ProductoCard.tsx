import { useState } from 'react'
import { formatPrecio } from '../../../shared/utils/format'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  )
  const [imgRota, setImgRota] = useState(false)
  const vendible = producto.disponible && producto.stock > 0
  const alLimite = enCarrito >= producto.stock

  return (
    <Card className="flex flex-col overflow-hidden">
      {producto.imagen_url && !imgRota ? (
        <img src={producto.imagen_url} alt={producto.nombre} className="h-40 w-full object-cover" loading="lazy" onError={() => setImgRota(true)} />
      ) : (
        <div className="flex h-40 items-center justify-center bg-stone-100 text-4xl">🍽️</div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase text-orange-600">{producto.categoria.nombre}</span>
        <h3 className="mt-1 font-semibold">{producto.nombre}</h3>
        <p className="mt-1 flex-1 text-sm text-stone-500">{producto.descripcion}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{formatPrecio(producto.precio_base)}</span>
          <span className="text-xs text-stone-500">
            {vendible ? `Stock: ${producto.stock}` : 'No disponible'}
          </span>
        </div>
        <Button
          className="mt-3"
          disabled={!vendible || alLimite}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
              stock: producto.stock,
              imagen_url: producto.imagen_url,
            })
          }
        >
          {!vendible ? 'Sin stock' : alLimite ? 'Máximo en carrito' : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}
