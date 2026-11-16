import { formatPrecio } from '../../../shared/utils/format'
import type { Pedido } from '../types'

export function DetallePedidoLista({ pedido }: { pedido: Pedido }) {
  return (
    <div className="text-sm">
      <table className="w-full">
        <thead className="text-left text-xs uppercase text-stone-500">
          <tr>
            <th className="py-1">Producto</th>
            <th className="py-1 text-right">Cant.</th>
            <th className="py-1 text-right">Precio</th>
            <th className="py-1 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((i) => (
            <tr key={i.producto_id} className="border-t border-stone-100">
              <td className="py-1">{i.nombre_producto}</td>
              <td className="py-1 text-right">{i.cantidad}</td>
              <td className="py-1 text-right">{formatPrecio(i.precio_unitario)}</td>
              <td className="py-1 text-right">{formatPrecio(i.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-stone-600">
        <dt className="font-medium">Dirección:</dt>
        <dd>{pedido.direccion_entrega}</dd>
        <dt className="font-medium">Pago:</dt>
        <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
        {pedido.notas && (
          <>
            <dt className="font-medium">Notas:</dt>
            <dd>{pedido.notas}</dd>
          </>
        )}
      </dl>
    </div>
  )
}
