import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cambiarEstado, cancelarPedido, createPedido, getPedidos, getResumen } from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos } from '../types'

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ['pedidos-resumen'], queryFn: getResumen })
}

/** Un pedido modifica pedidos, resumen y stock de productos. */
function useInvalidarTodo() {
  const qc = useQueryClient()
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ['pedidos'] }),
      qc.invalidateQueries({ queryKey: ['pedidos-resumen'] }),
      qc.invalidateQueries({ queryKey: ['productos'] }),
    ])
}

export function useCrearPedido() {
  const invalidar = useInvalidarTodo()
  return useMutation({ mutationFn: createPedido, onSuccess: invalidar })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarTodo()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstado(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarTodo()
  return useMutation({ mutationFn: cancelarPedido, onSuccess: invalidar })
}
