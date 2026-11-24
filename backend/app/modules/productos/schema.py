from sqlmodel import SQLModel, Field
from pydantic import FiniteFloat

from app.modules.categorias.schema import CategoriaRead


class ProductoCreate(SQLModel):
    categoria_id: int = Field(gt=0)
    nombre: str = Field(min_length=2, max_length=120)
    descripcion: str = Field(default="", max_length=500)
    precio_base: FiniteFloat = Field(ge=0)
    imagen_url: str = Field(default="")
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(SQLModel):
    categoria_id: int | None = Field(default=None, gt=0)
    nombre: str | None = Field(default=None, min_length=2, max_length=120)
    descripcion: str | None = Field(default=None, max_length=500)
    precio_base: FiniteFloat | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None


class ProductoStockUpdate(SQLModel):
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None


class ProductoRead(ProductoCreate):
    id: int
    activo: bool
    categoria: CategoriaRead


class ProductoPage(SQLModel):
    total: int
    items: list[ProductoRead]

