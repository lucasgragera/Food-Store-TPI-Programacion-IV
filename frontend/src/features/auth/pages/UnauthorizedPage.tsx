import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/Card'

export function UnauthorizedPage({ noEncontrada = false }: { noEncontrada?: boolean }) {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <h1 className="mb-2 text-2xl font-bold">
        {noEncontrada ? 'Página no encontrada' : 'Sin permiso'}
      </h1>
      <p className="mb-4 text-stone-600">
        {noEncontrada
          ? 'La página que buscás no existe.'
          : 'No tenés permisos para acceder a esta pantalla.'}
      </p>
      <Link to="/" className="font-medium text-orange-600 hover:underline">
        Volver al inicio
      </Link>
    </Card>
  )
}
