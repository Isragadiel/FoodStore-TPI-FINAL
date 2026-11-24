from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.config import settings
from app.core.database import get_session
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.db.models import Usuario
from app.modules.auth.service import AuthService
from app.modules.usuarios.schema import UserCreate, UserPublic


router = APIRouter(
    prefix="/auth",
    tags=["Autenticacion"],
)


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=201,
)
def register(
    data: UserCreate,
    session: Session = Depends(get_session),
):
    return AuthService(session).register(data)


@router.post("/token")
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    usuario = AuthService(session).authenticate(
        form.username,
        form.password,
    )

    token = create_access_token(str(usuario.id))

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return {"message": "Login exitoso"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax",
    )

    return {"message": "Sesion cerrada"}


@router.get("/me", response_model=UserPublic)
def me(
    usuario: Usuario = Depends(get_current_active_user),
):
    return UserPublic.model_validate(usuario)
