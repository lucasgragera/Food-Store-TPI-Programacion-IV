import axios from 'axios'

interface ValidationItem {
  msg?: string
  loc?: (string | number)[]
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor.'
    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return (detail as ValidationItem[])
        .map((d) => d.msg ?? 'Dato invalido')
        .join('. ')
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrio un error inesperado.'
}
