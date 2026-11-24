from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from app.core.exceptions import (
    NotFoundError,
    BusinessRuleError,
)
from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.model import (
    Pedido,
    DetallePedido,
    EstadoPedido,
)
from app.modules.pedidos.schema import (
    PedidoCreate,
    PedidoRead,
    PedidoPage,
    PedidoResumen,
)


TRANSICIONES = {
    EstadoPedido.PENDIENTE: {
        EstadoPedido.EN_PREPARACION,
        EstadoPedido.CANCELADO,
    },
    EstadoPedido.EN_PREPARACION: {
        EstadoPedido.ENTREGADO,
        EstadoPedido.CANCELADO,
    },
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


class PedidoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario_id: int):
        ids = [item.producto_id for item in data.items]

        if not ids:
            raise BusinessRuleError("El pedido no tiene productos")

        if len(ids) != len(set(ids)):
            raise BusinessRuleError("No se permiten productos repetidos")

        direccion = data.direccion_entrega.strip()

        if len(direccion) < 5:
            raise BusinessRuleError("Direccion invalida")

        with self.uow as uow:
            pedido = Pedido(
                usuario_id=usuario_id,
                forma_pago=data.forma_pago,
                direccion_entrega=direccion,
                notas=data.notas,
                estado=EstadoPedido.PENDIENTE,
                total=0,
            )

            uow.pedidos.add(pedido)

            total = Decimal("0.00")

            for item in sorted(
                data.items,
                key=lambda item: item.producto_id,
            ):
                producto = uow.productos.bloquear(
                    item.producto_id
                )

                if producto is None or not producto.activo:
                    raise NotFoundError("Producto no encontrado")

                if not producto.disponible:
                    raise BusinessRuleError(
                        f"Producto no disponible: {producto.nombre}"
                    )

                if producto.stock < item.cantidad:
                    raise BusinessRuleError(
                        f"Stock insuficiente: {producto.nombre}"
                    )

                precio = Decimal(str(producto.precio_base))

                subtotal = (precio * item.cantidad).quantize(
                    Decimal("0.01"),
                    rounding=ROUND_HALF_UP,
                )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=float(precio),
                    subtotal=float(subtotal),
                )

                uow.detalles.add(detalle)
                total += subtotal

            pedido.total = float(total)
            uow.pedidos.add(pedido)
            uow.session.refresh(pedido)

            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        usuario_id,
        es_admin,
        estado=None,
        skip=0,
        limit=20,
    ):
        with self.uow as uow:
            total, items = uow.pedidos.listar(
                usuario_id=None if es_admin else usuario_id,
                estado=estado,
                skip=skip,
                limit=limit,
            )

            return PedidoPage(
                total=total,
                items=[
                    PedidoRead.model_validate(p)
                    for p in items
                ],
            )

    def obtener(self, pedido_id, usuario_id, es_admin):
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)

            if pedido is None:
                raise NotFoundError("Pedido no encontrado")

            if not es_admin and pedido.usuario_id != usuario_id:
                raise NotFoundError("Pedido no encontrado")

            return PedidoRead.model_validate(pedido)

    def _restituir_stock(self, uow, pedido):
        for item in sorted(
            pedido.items,
            key=lambda item: item.producto_id,
        ):
            producto = uow.productos.bloquear(
                item.producto_id
            )

            if producto is None:
                raise BusinessRuleError(
                    "No se pudo restituir el stock"
                )

            producto.stock += item.cantidad
            uow.productos.add(producto)

    def _cambiar_estado(self, uow, pedido, nuevo_estado):
        permitidos = TRANSICIONES[pedido.estado]

        if nuevo_estado not in permitidos:
            raise BusinessRuleError(
                "Transicion de estado no permitida"
            )

        if nuevo_estado == EstadoPedido.CANCELADO:
            self._restituir_stock(uow, pedido)

        pedido.estado = nuevo_estado
        pedido.updated_at = datetime.now(timezone.utc)

        uow.pedidos.add(pedido)

        return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id, nuevo_estado):
        with self.uow as uow:
            pedido = uow.pedidos.bloquear(pedido_id)

            if pedido is None:
                raise NotFoundError("Pedido no encontrado")

            return self._cambiar_estado(
                uow, pedido, nuevo_estado
            )

    def cancelar(self, pedido_id, usuario_id):
        with self.uow as uow:
            pedido = uow.pedidos.bloquear(pedido_id)

            if pedido is None or pedido.usuario_id != usuario_id:
                raise NotFoundError("Pedido no encontrado")

            if pedido.estado != EstadoPedido.PENDIENTE:
                raise BusinessRuleError(
                    "Solo se pueden cancelar pedidos pendientes"
                )

            return self._cambiar_estado(
                uow, pedido, EstadoPedido.CANCELADO
            )

    def resumen(self):
        with self.uow as uow:
            return PedidoResumen(**uow.pedidos.resumen())
