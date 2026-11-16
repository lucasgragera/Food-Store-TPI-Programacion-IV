import { useForm } from '@tanstack/react-form'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { FieldError } from '../../../shared/components/FieldError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatPrecio } from '../../../shared/utils/format'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import {
  useActualizarStock,
  useEliminarProducto,
  useGuardarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto } from '../types'

function ProductoForm({ producto, onListo }: { producto: Producto | null; onListo: () => void }) {
  const guardar = useGuardarProducto()
  const categorias = useCategorias()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? 0,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await guardar.mutateAsync({
          id: producto?.id,
          data: {
            ...value,
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim() || null,
            imagen_url: value.imagen_url.trim() || null,
          },
        })
        onListo()
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  const inputCls = 'mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm'
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El nombre es obligatorio') }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              className={inputCls}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError field={field} />
          </div>
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              className={inputCls}
              rows={2}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>
      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="precio_base"
          validators={{ onChange: ({ value }) => (value >= 0 ? undefined : 'Debe ser mayor o igual a 0') }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium">Precio</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <FieldError field={field} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              Number.isInteger(value) && value >= 0 ? undefined : 'Entero mayor o igual a 0',
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <input
                type="number"
                min={0}
                step={1}
                className={inputCls}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <FieldError field={field} />
            </div>
          )}
        </form.Field>
      </div>
      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría') }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium">Categoría</label>
            <select
              className={inputCls}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            >
              <option value={0}>Seleccionar...</option>
              {categorias.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <FieldError field={field} />
          </div>
        )}
      </form.Field>
      <form.Field name="imagen_url">
        {(field) => (
          <div>
            <label className="block text-sm font-medium">URL de imagen</label>
            <input
              className={inputCls}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {producto ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

function StockForm({ producto, onListo }: { producto: Producto; onListo: () => void }) {
  const actualizar = useActualizarStock()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await actualizar.mutateAsync({ id: producto.id, data: value })
        onListo()
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
      <p className="text-sm text-stone-600">{producto.nombre}</p>
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isInteger(value) && value >= 0 ? undefined : 'Entero mayor o igual a 0',
        }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium">Stock</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
            <FieldError field={field} />
          </div>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <Button type="submit" className="w-full">
        Actualizar
      </Button>
    </form>
  )
}

export function AdminProductosPage() {
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const eliminar = useEliminarProducto()
  const [editando, setEditando] = useState<Producto | null>(null)
  const [formAbierto, setFormAbierto] = useState(false)
  const [stockDe, setStockDe] = useState<Producto | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { id: 'categoria', header: 'Categoría', cell: ({ row }) => row.original.categoria.nombre },
    { id: 'precio', header: 'Precio', cell: ({ row }) => formatPrecio(row.original.precio_base) },
    { accessorKey: 'stock', header: 'Stock' },
    {
      id: 'disponible',
      header: 'Disponible',
      cell: ({ row }) => (row.original.disponible ? 'Sí' : 'No'),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variante="secondary"
            pequeno
            onClick={() => {
              setEditando(row.original)
              setFormAbierto(true)
            }}
          >
            Editar
          </Button>
          <Button variante="secondary" pequeno onClick={() => setStockDe(row.original)}>
            Stock
          </Button>
          <Button
            variante="danger"
            pequeno
            onClick={async () => {
              if (!window.confirm(`¿Dar de baja "${row.original.nombre}"?`)) return
              setErrorAccion(null)
              try {
                await eliminar.mutateAsync(row.original.id)
              } catch (e) {
                setErrorAccion(handleApiError(e))
              }
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button
          onClick={() => {
            setEditando(null)
            setFormAbierto(true)
          }}
        >
          Nuevo producto
        </Button>
      </div>
      {errorAccion && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{errorAccion}</p>}
      {isLoading && <Skeleton className="h-40 w-full" />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && <DataTable columns={columns} data={data.items} vacio="No hay productos." />}
      <Modal
        abierto={formAbierto}
        titulo={editando ? 'Editar producto' : 'Nuevo producto'}
        onCerrar={() => setFormAbierto(false)}
      >
        <ProductoForm key={editando?.id ?? 'nuevo'} producto={editando} onListo={() => setFormAbierto(false)} />
      </Modal>
      <Modal abierto={stockDe !== null} titulo="Stock y disponibilidad" onCerrar={() => setStockDe(null)}>
        {stockDe && <StockForm key={stockDe.id} producto={stockDe} onListo={() => setStockDe(null)} />}
      </Modal>
    </div>
  )
}
