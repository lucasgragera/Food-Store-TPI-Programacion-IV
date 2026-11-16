import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types'

export async function getPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  return (await axiosInstance.get<PedidosPaginados>('/pedidos', { params: filtros })).data
}

export async function getResumen(): Promise<ResumenPedidos> {
  return (await axiosInstance.get<ResumenPedidos>('/pedidos/resumen')).data
}

export async function createPedido(data: PedidoCreate): Promise<Pedido> {
  return (await axiosInstance.post<Pedido>('/pedidos', data)).data
}

export async function cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
  return (await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  return (await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`)).data
}
