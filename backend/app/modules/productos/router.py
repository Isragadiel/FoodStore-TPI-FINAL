from fastapi import APIRouter, Depends, Query, Response

from app.core.deps import require_role
from app.core.unit_of_work import UnitOfWork
from app.modules.productos.service import ProductoService
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductoPage,
)


router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
)

admin_required = require_role(["admin"])


def get_service():
    return ProductoService(UnitOfWork())


@router.get("", response_model=ProductoPage)
def listar(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
    service: ProductoService = Depends(get_service),
):
    return service.listar(
        skip, limit, search,
        categoria_id, disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener(
    producto_id: int,
    service: ProductoService = Depends(get_service),
):
    return service.obtener(producto_id)


@router.post(
    "",
    response_model=ProductoRead,
    status_code=201,
    dependencies=[Depends(admin_required)],
)
def crear(
    data: ProductoCreate,
    service: ProductoService = Depends(get_service),
):
    return service.crear(data)


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=[Depends(admin_required)],
)
def actualizar(
    producto_id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_service),
):
    return service.actualizar(producto_id, data)


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=[Depends(admin_required)],
)
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_service),
):
    return service.actualizar_stock(producto_id, data)


@router.delete(
    "/{producto_id}",
    status_code=204,
    dependencies=[Depends(admin_required)],
)
def eliminar(
    producto_id: int,
    service: ProductoService = Depends(get_service),
):
    service.eliminar(producto_id)
    return Response(status_code=204)
