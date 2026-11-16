import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  StockInput,
} from '../types'

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  return (await axiosInstance.get<ProductosPaginados>('/productos', { params: filtros })).data
}

export async function createProducto(data: ProductoInput): Promise<Producto> {
  return (await axiosInstance.post<Producto>('/productos', data)).data
}

export async function updateProducto(id: number, data: ProductoInput): Promise<Producto> {
  return (await axiosInstance.put<Producto>(`/productos/${id}`, data)).data
}

export async function updateStock(id: number, data: StockInput): Promise<Producto> {
  return (await axiosInstance.patch<Producto>(`/productos/${id}/stock`, data)).data
}

export async function deleteProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`)
}
