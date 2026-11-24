from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.model import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def buscar_activo(self, producto_id: int):
        producto = self.get_by_id(producto_id)

        if producto is None or not producto.activo:
            return None

        return producto

    def listar(
        self,
        skip=0,
        limit=20,
        search=None,
        categoria_id=None,
        disponible=None,
    ):
        filtros = [Producto.activo == True]

        if search:
            filtros.append(
                Producto.nombre.ilike(f"%{search}%")
            )

        if categoria_id is not None:
            filtros.append(
                Producto.categoria_id == categoria_id
            )

        if disponible is not None:
            filtros.append(
                Producto.disponible == disponible
            )

        total = self.session.exec(
            select(func.count(Producto.id)).where(*filtros)
        ).one()

        items = self.session.exec(
            select(Producto)
            .where(*filtros)
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        ).all()

        return total, list(items)

    def bloquear(self, producto_id: int):
        return self.session.exec(
            select(Producto)
            .where(Producto.id == producto_id)
            .with_for_update()
        ).first()
