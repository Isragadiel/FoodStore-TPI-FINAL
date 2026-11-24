from sqlmodel import Field, Relationship, SQLModel


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=2, max_length=100, unique=True)
    descripcion: str = Field(default="")
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(
        back_populates="categoria"
    )
