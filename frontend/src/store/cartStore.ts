import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock: number
  imagen_url: string | null
}

interface CartState {
  items: ItemCarrito[]
  agregar: (item: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (item, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === item.producto_id)
          if (existente) {
            const nueva = Math.min(existente.cantidad + cantidad, Math.max(item.stock, 1))
            return {
              items: state.items.map((i) =>
                i.producto_id === item.producto_id ? { ...i, ...item, cantidad: nueva } : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, cantidad: Math.min(cantidad, Math.max(item.stock, 1)) }] }
        }),
      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),
      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === productoId
              ? { ...i, cantidad: Math.max(1, Math.min(cantidad, Math.max(i.stock, 1))) }
              : i,
          ),
        })),
      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),
    }),
    { name: 'cart-storage' },
  ),
)
