from app.core.exceptions import NotFoundError, BusinessRuleError
from app.core.unit_of_work import UnitOfWork
from app.modules.productos.model import Producto
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductoPage,
)


class ProductoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def listar(
        self,
        skip=0,
        limit=20,
        search=None,
        categoria_id=None,
        disponible=None,
    ):
        with self.uow as uow:
            total, items = uow.productos.listar(
                skip, limit, search,
                categoria_id, disponible,
            )

            return ProductoPage(
                total=total,
                items=[
                    ProductoRead.model_validate(p)
                    for p in items
                ],
            )

    def obtener(self, producto_id: int):
        with self.uow as uow:
            producto = uow.productos.buscar_activo(
                producto_id
            )

            if producto is None:
                raise NotFoundError("Producto no encontrado")

            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate):
        with self.uow as uow:
            categoria = uow.categorias.buscar_activa(
                data.categoria_id
            )

            if categoria is None:
                raise NotFoundError("Categoria no encontrada")

            datos = data.model_dump()
            datos["nombre"] = data.nombre.strip()

            if len(datos["nombre"]) < 2:
                raise BusinessRuleError("Nombre invalido")

            producto = Producto(**datos, activo=True)

            uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def actualizar(
        self,
        producto_id: int,
        data: ProductoUpdate,
    ):
        with self.uow as uow:
            producto = uow.productos.bloquear(producto_id)

            if producto is None or not producto.activo:
                raise NotFoundError("Producto no encontrado")

            cambios = data.model_dump(
                exclude_unset=True,
                exclude_none=True,
            )

            if "categoria_id" in cambios:
                categoria = uow.categorias.buscar_activa(
                    cambios["categoria_id"]
                )

                if categoria is None:
                    raise NotFoundError("Categoria no encontrada")

            if "nombre" in cambios:
                cambios["nombre"] = cambios["nombre"].strip()

                if len(cambios["nombre"]) < 2:
                    raise BusinessRuleError("Nombre invalido")

            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)

            uow.session.refresh(producto)

            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self,
        producto_id: int,
        data: ProductoStockUpdate,
    ):
        with self.uow as uow:
            producto = uow.productos.bloquear(producto_id)

            if producto is None or not producto.activo:
                raise NotFoundError("Producto no encontrado")

            cambios = data.model_dump(
                exclude_unset=True,
                exclude_none=True,
            )

            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int):
        with self.uow as uow:
            producto = uow.productos.bloquear(producto_id)

            if producto is None or not producto.activo:
                raise NotFoundError("Producto no encontrado")

            producto.activo = False
            uow.productos.add(producto)
