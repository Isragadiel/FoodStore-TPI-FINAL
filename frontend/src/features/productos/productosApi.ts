import api from '../../shared/api/axiosInstance'
import type {
  Producto,
  Pagina,
} from '../../shared/api/types'

export type ProductoData = Omit<
  Producto,
  'id' | 'activo' | 'categoria'
>

export interface ProductoFiltros {
  skip?: number
  limit?: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}

export const productosApi = {
  listar: async (filtros: ProductoFiltros = {}) => {
    const params = new URLSearchParams()

    params.set('skip', String(filtros.skip ?? 0))
    params.set('limit', String(filtros.limit ?? 20))

    if (filtros.search?.trim()) {
      params.set('search', filtros.search.trim())
    }

    if (filtros.categoria_id !== undefined) {
      params.set('categoria_id', String(filtros.categoria_id))
    }

    if (filtros.disponible !== undefined) {
      params.set('disponible', String(filtros.disponible))
    }

    const response = await api.get<Pagina<Producto>>(
      `/productos?${params.toString()}`,
    )

    return response.data
  },

  obtener: async (id: number) =>
    (await api.get<Producto>(`/productos/${id}`)).data,

  crear: async (data: ProductoData) =>
    (await api.post<Producto>('/productos', data)).data,

  actualizar: async (
    id: number,
    data: Partial<ProductoData>,
  ) =>
    (await api.put<Producto>(`/productos/${id}`, data)).data,

  actualizarStock: async (
    id: number,
    data: Partial<Pick<Producto, 'stock' | 'disponible'>>,
  ) =>
    (await api.patch<Producto>(
      `/productos/${id}/stock`,
      data,
    )).data,

  eliminar: async (id: number) => {
    await api.delete(`/productos/${id}`)
  },
}
