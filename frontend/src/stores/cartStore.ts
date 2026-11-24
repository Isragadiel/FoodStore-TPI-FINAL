import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '../shared/api/types'

export interface CartItem {
  producto: Producto
  cantidad: number
}

interface CartState {
  items: CartItem[]
  agregar: (producto: Producto) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (
    productoId: number,
    cantidad: number,
  ) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto) => {
        if (
          !producto.activo ||
          !producto.disponible ||
          producto.stock <= 0
        ) {
          return
        }

        set((state) => {
          const existente = state.items.find(
            (item) => item.producto.id === producto.id,
          )

          if (existente) {
            return {
              items: state.items.map((item) =>
                item.producto.id === producto.id
                  ? {
                      producto,
                      cantidad: Math.min(
                        item.cantidad + 1,
                        producto.stock,
                      ),
                    }
                  : item,
              ),
            }
          }

          return {
            items: [
              ...state.items,
              { producto, cantidad: 1 },
            ],
          }
        })
      },

      quitar: (productoId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.producto.id !== productoId,
          ),
        }))
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (!Number.isFinite(cantidad)) return

        if (cantidad <= 0) {
          get().quitar(productoId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.producto.id === productoId
              ? {
                  ...item,
                  cantidad: Math.min(
                    Math.floor(cantidad),
                    item.producto.stock,
                  ),
                }
              : item,
          ),
        }))
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (total, item) =>
            total +
            item.producto.precio_base * item.cantidad,
          0,
        ),
    }),
    {
      name: 'food-store-cart',
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
)
