from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.model import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def listar_activas(self) -> list[Categoria]:
        return list(self.session.exec(
            select(Categoria)
            .where(Categoria.activo == True)
            .order_by(Categoria.nombre)
        ).all())

    def buscar_por_nombre(self, nombre: str):
        return self.session.exec(
            select(Categoria).where(
                Categoria.nombre == nombre
            )
        ).first()

    def buscar_activa(self, categoria_id: int):
        categoria = self.get_by_id(categoria_id)

        if categoria is None or not categoria.activo:
            return None

        return categoria
