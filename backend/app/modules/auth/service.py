from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select
from fastapi import HTTPException

from app.core.security import hash_password, verify_password
from app.db.models import Usuario
from app.modules.usuarios.model import Rol
from app.modules.usuarios.schema import UserCreate, UserPublic


class AuthService:
    def __init__(self, session: Session):
        self.session = session

    def register(self, data: UserCreate) -> UserPublic:
        existente = self.session.exec(
            select(Usuario).where(
                or_(
                    Usuario.username == data.username,
                    Usuario.email == data.email,
                )
            )
        ).first()

        if existente:
            raise HTTPException(
                status_code=409,
                detail="Usuario o email ya registrado",
            )

        usuario = Usuario(
            username=data.username,
            full_name=data.full_name,
            email=str(data.email),
            hashed_password=hash_password(data.password),
            role=Rol.USER,
            disabled=False,
        )

        try:
            self.session.add(usuario)
            self.session.commit()
            self.session.refresh(usuario)
        except IntegrityError:
            self.session.rollback()
            raise HTTPException(
                status_code=409,
                detail="Usuario o email ya registrado",
            )

        return UserPublic.model_validate(usuario)

    def authenticate(
        self,
        username: str,
        password: str,
    ) -> Usuario:
        usuario = self.session.exec(
            select(Usuario).where(
                Usuario.username == username
            )
        ).first()

        if (
            usuario is None
            or not verify_password(
                password, usuario.hashed_password
            )
        ):
            raise HTTPException(
                status_code=401,
                detail="Credenciales incorrectas",
            )

        if usuario.disabled:
            raise HTTPException(
                status_code=400,
                detail="Cuenta desactivada",
            )

        return usuario
