import { Button } from '../ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
      <p className="mb-3">{mensaje}</p>
      {onReintentar && (
        <Button variante="secondary" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
