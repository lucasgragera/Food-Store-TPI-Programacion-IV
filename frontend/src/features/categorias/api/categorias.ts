import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Categoria, CategoriaInput } from '../types'

export async function getCategorias(): Promise<Categoria[]> {
  return (await axiosInstance.get<Categoria[]>('/categorias')).data
}

export async function createCategoria(data: CategoriaInput): Promise<Categoria> {
  return (await axiosInstance.post<Categoria>('/categorias', data)).data
}

export async function updateCategoria(id: number, data: CategoriaInput): Promise<Categoria> {
  return (await axiosInstance.put<Categoria>(`/categorias/${id}`, data)).data
}

export async function deleteCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`)
}
