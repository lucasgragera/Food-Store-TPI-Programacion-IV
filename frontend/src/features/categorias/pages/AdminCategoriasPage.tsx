import type { ColumnDef } from '@tanstack/react-table'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { FieldError } from '../../../shared/components/FieldError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { useCategorias, useEliminarCategoria, useGuardarCategoria } from '../hooks/useCategorias'
import type { Categoria } from '../types'

function CategoriaForm({ categoria, onListo }: { categoria: Categoria | null; onListo: () => void }) {
  const guardar = useGuardarCategoria()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await guardar.mutateAsync({
          id: categoria?.id,
          data: { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null },
        })
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
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const n = value.trim().length
            return n < 2 || n > 100 ? 'El nombre debe tener entre 2 y 100 caracteres' : undefined
          },
        }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium">Nombre</label>
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
      <form.Field name="descripcion">
        {(field) => (
          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              rows={3}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {categoria ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export function AdminCategoriasPage() {
  const { data, isLoading, isError, error, refetch } = useCategorias()
  const eliminar = useEliminarCategoria()
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [abierto, setAbierto] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'descripcion', header: 'Descripción', cell: ({ row }) => row.original.descripcion ?? '—' },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variante="secondary"
            pequeno
            onClick={() => {
              setEditando(row.original)
              setAbierto(true)
            }}
          >
            Editar
          </Button>
          <Button
            variante="danger"
            pequeno
            onClick={async () => {
              if (!window.confirm(`¿Dar de baja la categoría "${row.original.nombre}"?`)) return
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
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button
          onClick={() => {
            setEditando(null)
            setAbierto(true)
          }}
        >
          Nueva categoría
        </Button>
      </div>
      {errorAccion && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{errorAccion}</p>}
      {isLoading && <Skeleton className="h-40 w-full" />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && <DataTable columns={columns} data={data} vacio="No hay categorías." />}
      <Modal
        abierto={abierto}
        titulo={editando ? 'Editar categoría' : 'Nueva categoría'}
        onCerrar={() => setAbierto(false)}
      >
        <CategoriaForm key={editando?.id ?? 'nueva'} categoria={editando} onListo={() => setAbierto(false)} />
      </Modal>
    </div>
  )
}
