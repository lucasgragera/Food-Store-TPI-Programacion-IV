import { useEffect, useState } from 'react'

/** Devuelve el valor recién después de que dejó de cambiar durante `delay` ms. */
export function useDebouncedValue<T>(valor: T, delay = 300): T {
  const [debounced, setDebounced] = useState(valor)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(valor), delay)
    return () => clearTimeout(id)
  }, [valor, delay])
  return debounced
}
