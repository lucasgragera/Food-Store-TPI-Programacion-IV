import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatFecha, formatPrecio } from '../../../shared/utils/format'
import { DetallePedidoLista } from '../components/DetallePedido'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'

const LIMIT = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [abierto, setAbierto] = useState<number | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * LIMIT, limit: LIMIT })
  const cancelar = useCancelarPedido()

  const onCancelar = async (id: number) => {
    if (!window.confirm(`¿Cancelar el pedido #${id}?`)) return
    setErrorAccion(null)
    try {
      await cancelar.mutateAsync(id)
    } catch (e) {
      setErrorAccion(handleApiError(e))
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>
      {errorAccion && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{errorAccion}</p>}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && data.items.length === 0 && <EstadoVacio mensaje="Todavía no hiciste ningún pedido." />}
      {data && data.items.length > 0 && (
        <>
          <div className="space-y-3">
            {data.items.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">Pedido #{p.id}</p>
                    <p className="text-xs text-stone-500">{formatFecha(p.created_at)}</p>
                  </div>
                  <BadgeEstado estado={p.estado} />
                  <p className="w-28 text-right font-bold">{formatPrecio(p.total)}</p>
                  <Button variante="secondary" pequeno onClick={() => setAbierto(abierto === p.id ? null : p.id)}>
                    {abierto === p.id ? 'Ocultar' : 'Ver detalle'}
                  </Button>
                  {p.estado === 'PENDIENTE' && (
                    <Button variante="danger" pequeno disabled={cancelar.isPending} onClick={() => void onCancelar(p.id)}>
                      Cancelar
                    </Button>
                  )}
                </div>
                {abierto === p.id && (
                  <div className="mt-4 border-t border-stone-100 pt-4">
                    <DetallePedidoLista pedido={p} />
                  </div>
                )}
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} limit={LIMIT} total={data.total} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
