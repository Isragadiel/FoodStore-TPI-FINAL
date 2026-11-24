from fastapi import Cookie, Depends, HTTPException
from jose import JWTError, jwt
from sqlmodel import Session

from app.core.config import settings
from app.core.database import get_session
from app.db.models import Usuario


def get_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
) -> Usuario:
    error = HTTPException(
        status_code=401,
        detail="Sesion invalida o expirada",
    )

    if not access_token:
        raise error

    try:
        payload = jwt.decode(
            access_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        subject = payload.get("sub")

        if subject is None:
            raise error

        user_id = int(subject)

    except (JWTError, ValueError, TypeError):
        raise error

    usuario = session.get(Usuario, user_id)

    if usuario is None:
        raise error

    return usuario


def get_current_active_user(
    usuario: Usuario = Depends(get_current_user),
) -> Usuario:
    if usuario.disabled:
        raise HTTPException(
            status_code=400,
            detail="Cuenta desactivada",
        )

    return usuario


def require_role(roles: list[str]):
    def dependency(
        usuario: Usuario = Depends(get_current_active_user),
    ) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=403,
                detail="Permisos insuficientes",
            )

        return usuario

    return dependency
