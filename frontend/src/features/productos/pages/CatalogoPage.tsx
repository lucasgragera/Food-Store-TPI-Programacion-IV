import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { useDebouncedValue } from '../../../shared/utils/useDebouncedValue'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMIT = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const search = useDebouncedValue(busqueda.trim(), 300)
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const categorias = useCategorias()
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
          placeholder="Buscar productos..."
          className="min-w-60 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
        />
        <select
          value={categoriaId ?? ''}
          onChange={(e) => {
            setPagina(0)
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
          }}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMIT }, (_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      )}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && data.items.length === 0 && <EstadoVacio mensaje="No encontramos productos con esos filtros." />}
      {data && data.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} limit={LIMIT} total={data.total} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
