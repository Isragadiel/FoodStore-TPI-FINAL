export type Rol = 'user' | 'admin'

export type EstadoPedido =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'ENTREGADO'
  | 'CANCELADO'

export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export interface Registro {
  username: string
  full_name: string
  email: string
  password: string
}

export interface Categoria {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
}

export interface Producto {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria
}

export interface DetallePedido {
  id: number
  producto_id: number
  cantidad: number
  nombre_producto: string
  precio_unitario: number
  subtotal: number
}

export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export interface PedidoCreate {
  forma_pago: FormaPago
  direccion_entrega: string
  notas?: string
  items: {
    producto_id: number
    cantidad: number
  }[]
}

export interface PedidoResumen {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

export interface Pagina<T> {
  total: number
  items: T[]
}
