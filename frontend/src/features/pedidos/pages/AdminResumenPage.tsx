import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatPrecio } from '../../../shared/utils/format'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos()
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Resumen del negocio</h1>
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pedidos pendientes" valor={data.pendientes} color="text-amber-600" />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} color="text-blue-600" />
          <ResumenCard titulo="Entregados" valor={data.entregados} color="text-green-600" />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} color="text-red-600" />
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <ResumenCard titulo="Ingresos (entregados)" valor={formatPrecio(data.ingresos_entregados)} color="text-green-700" />
        </div>
      )}
    </div>
  )
}
