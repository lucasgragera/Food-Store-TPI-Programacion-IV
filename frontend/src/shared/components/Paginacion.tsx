import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number
  limit: number
  total: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, limit, total, onCambiar }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / limit))
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      <Button variante="secondary" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span>
        Página {pagina + 1} de {paginas}
      </span>
      <Button
        variante="secondary"
        disabled={pagina + 1 >= paginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </div>
  )
}
