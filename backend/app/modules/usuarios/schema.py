from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel

from app.modules.usuarios.model import Rol


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña supera los 72 bytes")
        return value


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: Rol
    disabled: bool
    created_at: datetime
