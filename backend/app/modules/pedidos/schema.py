from datetime import datetime

from sqlmodel import SQLModel, Field

from app.modules.pedidos.model import EstadoPedido, FormaPago


class DetallePedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None
    items: list[DetallePedidoCreate] = Field(min_length=1)


class DetallePedidoRead(SQLModel):
    id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidoEstadoUpdate(SQLModel):
    estado: EstadoPedido


class PedidoPage(SQLModel):
    total: int
    items: list[PedidoRead]


class PedidoResumen(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
