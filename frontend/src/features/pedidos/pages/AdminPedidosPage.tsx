import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { DetallePedidoLista } from '../components/DetallePedido'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, Pedido } from '../types'

const SIGUIENTE: Partial<Record<EstadoPedido, { estado: EstadoPedido; label: string }>> = {
  PENDIENTE: { estado: 'EN_PREPARACION', label: 'Preparar' },
  EN_PREPARACION: { estado: 'ENTREGADO', label: 'Entregar' },
}

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

export function AdminPedidosPage() {
  const [filtro, setFiltro] = useState<EstadoPedido | ''>('')
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: 0,
    limit: 100,
    estado: filtro || undefined,
  })
  const cambiar = useCambiarEstadoPedido()

  const mover = async (id: number, estado: EstadoPedido) => {
    setErrorAccion(null)
    try {
      await cambiar.mutateAsync({ id, estado })
    } catch (e) {
      setErrorAccion(handleApiError(e))
    }
  }

  const columns: ColumnDef<Pedido>[] = [
    { id: 'id', header: '#', cell: ({ row }) => `#${row.original.id}` },
    { id: 'usuario', header: 'Usuario', cell: ({ row }) => row.original.usuario_id },
    { id: 'fecha', header: 'Fecha', cell: ({ row }) => formatFecha(row.original.created_at) },
    { id: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    { id: 'total', header: 'Total', cell: ({ row }) => formatPrecio(row.original.total) },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const p = row.original
        const sig = SIGUIENTE[p.estado]
        return (
          <div className="flex flex-wrap gap-2">
            <Button variante="secondary" pequeno onClick={() => setDetalle(p)}>
              Detalle
            </Button>
            {sig && (
              <Button pequeno disabled={cambiar.isPending} onClick={() => void mover(p.id, sig.estado)}>
                {sig.label}
              </Button>
            )}
            {sig && (
              <Button
                variante="danger"
                pequeno
                disabled={cambiar.isPending}
                onClick={() => {
                  if (window.confirm(`¿Cancelar el pedido #${p.id}? Se restituirá el stock.`)) {
                    void mover(p.id, 'CANCELADO')
                  }
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as EstadoPedido | '')}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      {errorAccion && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{errorAccion}</p>}
      {isLoading && <Skeleton className="h-40 w-full" />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && <DataTable columns={columns} data={data.items} vacio="No hay pedidos." />}
      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onCerrar={() => setDetalle(null)}>
        {detalle && <DetallePedidoLista pedido={detalle} />}
      </Modal>
    </div>
  )
}
