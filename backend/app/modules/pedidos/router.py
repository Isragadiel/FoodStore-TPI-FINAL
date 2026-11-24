from fastapi import APIRouter, Depends, Query

from app.core.deps import (
    get_current_active_user,
    require_role,
)
from app.core.unit_of_work import UnitOfWork
from app.db.models import Usuario
from app.modules.usuarios.model import Rol
from app.modules.pedidos.model import EstadoPedido
from app.modules.pedidos.service import PedidoService
from app.modules.pedidos.schema import (
    PedidoCreate,
    PedidoRead,
    PedidoPage,
    PedidoEstadoUpdate,
    PedidoResumen,
)


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
)

admin_required = require_role(["admin"])


def get_service():
    return PedidoService(UnitOfWork())


@router.post("", response_model=PedidoRead, status_code=201)
def crear(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_service),
):
    return service.crear(data, usuario.id)


@router.get("", response_model=PedidoPage)
def listar(
    estado: EstadoPedido | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_service),
):
    return service.listar(
        usuario.id,
        usuario.role == Rol.ADMIN,
        estado,
        skip,
        limit,
    )


@router.get(
    "/resumen",
    response_model=PedidoResumen,
    dependencies=[Depends(admin_required)],
)
def resumen(service: PedidoService = Depends(get_service)):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_service),
):
    return service.obtener(
        pedido_id,
        usuario.id,
        usuario.role == Rol.ADMIN,
    )


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    dependencies=[Depends(admin_required)],
)
def cambiar_estado(
    pedido_id: int,
    data: PedidoEstadoUpdate,
    service: PedidoService = Depends(get_service),
):
    return service.cambiar_estado(pedido_id, data.estado)


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
)
def cancelar(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_service),
):
    return service.cancelar(pedido_id, usuario.id)
