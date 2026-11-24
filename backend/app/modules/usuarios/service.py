from fastapi import HTTPException
from sqlmodel import Session, select

from app.db.models import Usuario
from app.modules.usuarios.schema import UserPublic


class UsuarioService:
    def __init__(self, session: Session):
        self.session = session

    def listar(self) -> list[UserPublic]:
        usuarios = self.session.exec(
            select(Usuario).order_by(Usuario.id)
        ).all()

        return [
            UserPublic.model_validate(usuario)
            for usuario in usuarios
        ]

    def cambiar_estado(
        self,
        usuario_id: int,
        disabled: bool,
        admin_id: int,
    ) -> UserPublic:

        usuario = self.session.get(Usuario, usuario_id)

        if usuario is None:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado",
            )

        if disabled and usuario_id == admin_id:
            raise HTTPException(
                status_code=400,
                detail="No puede desactivar su propia cuenta",
            )

        usuario.disabled = disabled

        self.session.add(usuario)
        self.session.commit()
        self.session.refresh(usuario)

        return UserPublic.model_validate(usuario)
