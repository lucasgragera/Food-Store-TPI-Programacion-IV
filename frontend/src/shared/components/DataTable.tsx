import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { EstadoVacio } from './EstadoVacio'
import { Button } from '../ui/Button'

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  vacio?: string
  pageSize?: number
}

/** Tabla con paginación del lado del cliente (el panel pide limit=100). */
export function DataTable<T>({ columns, data, vacio = 'Sin resultados.', pageSize = 10 }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  if (data.length === 0) return <EstadoVacio mensaje={vacio} />

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase text-stone-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 font-semibold">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-3 text-sm">
        <Button variante="secondary" pequeno disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
          Anterior
        </Button>
        <span>
          {table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
        </span>
        <Button variante="secondary" pequeno disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
