from sqlmodel import Session

from app.core.database import engine
from app.core.base_repository import BaseRepository
from app.db.models import Usuario, DetallePedido

from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository
from app.modules.pedidos.repository import PedidoRepository


class UnitOfWork:
    def __enter__(self):
        self.session = Session(engine)

        self.usuarios = BaseRepository(self.session, Usuario)
        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)
        self.pedidos = PedidoRepository(self.session)
        self.detalles = BaseRepository(self.session, DetallePedido)

        return self

    def __exit__(self, exc_type, exc_value, traceback):
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()

        except Exception:
            self.session.rollback()
            raise

        finally:
            self.session.close()

        return False
