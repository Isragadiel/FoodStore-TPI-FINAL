from datetime import datetime, timezone

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.model import Pedido, EstadoPedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def bloquear(self, pedido_id: int):
        return self.session.exec(
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .with_for_update()
        ).first()

    def listar(
        self,
        usuario_id=None,
        estado=None,
        skip=0,
        limit=20,
    ):
        filtros = []

        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)

        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count(Pedido.id)).where(*filtros)
        ).one()

        items = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .order_by(Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        ).all()

        return total, list(items)

    def resumen(self):
        def contar(estado):
            return self.session.exec(
                select(func.count(Pedido.id))
                .where(Pedido.estado == estado)
            ).one()

        inicio_hoy = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        pedidos_hoy = self.session.exec(
            select(func.count(Pedido.id))
            .where(Pedido.created_at >= inicio_hoy)
        ).one()

        ingresos = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0))
            .where(Pedido.estado == EstadoPedido.ENTREGADO)
        ).one()

        return {
            "pendientes": contar(EstadoPedido.PENDIENTE),
            "en_preparacion": contar(EstadoPedido.EN_PREPARACION),
            "entregados": contar(EstadoPedido.ENTREGADO),
            "cancelados": contar(EstadoPedido.CANCELADO),
            "pedidos_hoy": pedidos_hoy,
            "ingresos_entregados": float(ingresos),
        }
