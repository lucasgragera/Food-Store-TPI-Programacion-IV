import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  updateStock,
} from '../api/productos'
import type { FiltrosProductos, ProductoInput, StockInput } from '../types'

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useGuardarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ProductoInput }) =>
      id ? updateProducto(id, data) : createProducto(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useActualizarStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockInput }) => updateStock(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useEliminarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}
