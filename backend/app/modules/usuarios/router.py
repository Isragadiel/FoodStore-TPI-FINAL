from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_role
from app.db.models import Usuario
from app.modules.usuarios.schema import UserPublic
from app.modules.usuarios.service import UsuarioService


router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Administracion de usuarios"],
)

admin_required = require_role(["admin"])


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    admin: Usuario = Depends(admin_required),
    session: Session = Depends(get_session),
):
    return UsuarioService(session).listar()


@router.post(
    "/{usuario_id}/activar",
    response_model=UserPublic,
)
def activar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(admin_required),
    session: Session = Depends(get_session),
):
    return UsuarioService(session).cambiar_estado(
        usuario_id, False, admin.id
    )


@router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic,
)
def desactivar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(admin_required),
    session: Session = Depends(get_session),
):
    return UsuarioService(session).cambiar_estado(
        usuario_id, True, admin.id
    )
