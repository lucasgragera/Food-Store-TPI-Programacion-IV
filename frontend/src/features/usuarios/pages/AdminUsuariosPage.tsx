import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import type { UserPublic } from '../../auth/types'
import { useCambiarActivo, useUsuarios } from '../hooks/useUsuarios'

export function AdminUsuariosPage() {
  const { data, isLoading, isError, error, refetch } = useUsuarios()
  const cambiar = useCambiarActivo()
  const yo = useAuthStore((s) => s.usuario)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const ejecutar = async (id: number, activar: boolean) => {
    setErrorAccion(null)
    try {
      await cambiar.mutateAsync({ id, activar })
    } catch (e) {
      setErrorAccion(handleApiError(e))
    }
  }

  const columns: ColumnDef<UserPublic>[] = [
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol' },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="text-red-600">Desactivado</span>
        ) : (
          <span className="text-green-700">Activo</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex gap-2">
            {u.disabled && (
              <Button pequeno onClick={() => void ejecutar(u.id, true)}>
                Activar
              </Button>
            )}
            {!u.disabled && u.id !== yo?.id && (
              <Button variante="danger" pequeno onClick={() => void ejecutar(u.id, false)}>
                Desactivar
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
      {errorAccion && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{errorAccion}</p>}
      {isLoading && <Skeleton className="h-40 w-full" />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && <DataTable columns={columns} data={data} vacio="No hay usuarios." />}
    </div>
  )
}
