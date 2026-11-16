import { Card } from '../../../shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string | number
  color?: string
}

export function ResumenCard({ titulo, valor, color = 'text-stone-800' }: ResumenCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm text-stone-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{valor}</p>
    </Card>
  )
}
