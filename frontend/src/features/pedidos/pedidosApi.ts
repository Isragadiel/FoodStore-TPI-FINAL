import api from '../../shared/api/axiosInstance'
import type {
  Pedido,
  PedidoCreate,
  PedidoResumen,
  EstadoPedido,
  Pagina,
} from '../../shared/api/types'

export const pedidosApi = {
  listar: async (
    params: {
      skip?: number
      limit?: number
      estado?: EstadoPedido
    } = {},
  ) =>
    (await api.get<Pagina<Pedido>>('/pedidos', {
      params,
    })).data,

  obtener: async (id: number) =>
    (await api.get<Pedido>(`/pedidos/${id}`)).data,

  crear: async (data: PedidoCreate) =>
    (await api.post<Pedido>('/pedidos', data)).data,

  cancelar: async (id: number) =>
    (await api.patch<Pedido>(
      `/pedidos/${id}/cancelar`,
    )).data,

  cambiarEstado: async (
    id: number,
    estado: EstadoPedido,
  ) =>
    (await api.patch<Pedido>(
      `/pedidos/${id}/estado`,
      { estado },
    )).data,

  resumen: async () =>
    (await api.get<PedidoResumen>('/pedidos/resumen')).data,
}
