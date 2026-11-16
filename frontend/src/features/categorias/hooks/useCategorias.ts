import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategoria,
  deleteCategoria,
  getCategorias,
  updateCategoria,
} from '../api/categorias'
import type { CategoriaInput } from '../types'

export function useCategorias() {
  return useQuery({ queryKey: ['categorias'], queryFn: getCategorias })
}

export function useGuardarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: CategoriaInput }) =>
      id ? updateCategoria(id, data) : createCategoria(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export function useEliminarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}
