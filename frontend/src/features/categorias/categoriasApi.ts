import api from '../../shared/api/axiosInstance'
import type { Categoria } from '../../shared/api/types'

type CategoriaData = Pick<Categoria, 'nombre' | 'descripcion'>

export const categoriasApi = {
  listar: async () =>
    (await api.get<Categoria[]>('/categorias')).data,

  crear: async (data: CategoriaData) =>
    (await api.post<Categoria>('/categorias', data)).data,

  actualizar: async (
    id: number,
    data: Partial<CategoriaData>,
  ) =>
    (await api.put<Categoria>(`/categorias/${id}`, data)).data,

  eliminar: async (id: number) => {
    await api.delete(`/categorias/${id}`)
  },
}
