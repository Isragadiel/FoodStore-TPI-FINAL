from datetime import datetime, timezone
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel


class Rol(str, Enum):
    USER = "user"
    ADMIN = "admin"


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: Rol = Field(default=Rol.USER)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    pedidos: list["Pedido"] = Relationship(
        back_populates="usuario"
    )
