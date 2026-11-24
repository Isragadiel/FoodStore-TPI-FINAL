from fastapi import APIRouter, Depends, Response

from app.core.deps import require_role
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.service import CategoriaService
from app.modules.categorias.schema import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaRead,
)


router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"],
)

admin_required = require_role(["admin"])


def get_service():
    return CategoriaService(UnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_service)):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener(
    categoria_id: int,
    service: CategoriaService = Depends(get_service),
):
    return service.obtener(categoria_id)


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=201,
    dependencies=[Depends(admin_required)],
)
def crear(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_service),
):
    return service.crear(data)


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(admin_required)],
)
def actualizar(
    categoria_id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_service),
):
    return service.actualizar(categoria_id, data)


@router.delete(
    "/{categoria_id}",
    status_code=204,
    dependencies=[Depends(admin_required)],
)
def eliminar(
    categoria_id: int,
    service: CategoriaService = Depends(get_service),
):
    service.eliminar(categoria_id)
    return Response(status_code=204)
