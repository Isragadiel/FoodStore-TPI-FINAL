from sqlalchemy.exc import IntegrityError

from app.core.exceptions import (
    NotFoundError,
    ConflictError,
    BusinessRuleError,
)
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.model import Categoria
from app.modules.categorias.schema import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)


class CategoriaService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def listar(self):
        with self.uow as uow:
            return [
                CategoriaRead.model_validate(c)
                for c in uow.categorias.listar_activas()
            ]

    def obtener(self, categoria_id: int):
        with self.uow as uow:
            categoria = uow.categorias.buscar_activa(
                categoria_id
            )

            if categoria is None:
                raise NotFoundError("Categoria no encontrada")

            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate):
        nombre = data.nombre.strip()

        if len(nombre) < 2:
            raise BusinessRuleError("Nombre invalido")

        try:
            with self.uow as uow:
                if uow.categorias.buscar_por_nombre(nombre):
                    raise ConflictError("Categoria duplicada")

                categoria = Categoria(
                    nombre=nombre,
                    descripcion=data.descripcion,
                    activo=True,
                )

                uow.categorias.add(categoria)

                return CategoriaRead.model_validate(categoria)

        except IntegrityError as exc:
            raise ConflictError("Categoria duplicada") from exc

    def actualizar(self, categoria_id: int, data: CategoriaUpdate):
        try:
            with self.uow as uow:
                categoria = uow.categorias.buscar_activa(
                    categoria_id
                )

                if categoria is None:
                    raise NotFoundError("Categoria no encontrada")

                cambios = data.model_dump(
                    exclude_unset=True,
                    exclude_none=True,
                )

                if "nombre" in cambios:
                    nombre = cambios["nombre"].strip()

                    if len(nombre) < 2:
                        raise BusinessRuleError("Nombre invalido")

                    existente = uow.categorias.buscar_por_nombre(
                        nombre
                    )

                    if existente and existente.id != categoria_id:
                        raise ConflictError("Categoria duplicada")

                    cambios["nombre"] = nombre

                categoria.sqlmodel_update(cambios)
                uow.categorias.add(categoria)

                return CategoriaRead.model_validate(categoria)

        except IntegrityError as exc:
            raise ConflictError("Categoria duplicada") from exc

    def eliminar(self, categoria_id: int):
        with self.uow as uow:
            categoria = uow.categorias.buscar_activa(
                categoria_id
            )

            if categoria is None:
                raise NotFoundError("Categoria no encontrada")

            categoria.activo = False
            uow.categorias.add(categoria)
