export function formatPrecio(valor: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor)
}

export function formatFecha(iso: string): string {
  // El backend entrega fechas UTC sin zona; se interpretan como UTC.
  const fecha = new Date(iso.endsWith('Z') ? iso : `${iso}Z`)
  return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}
