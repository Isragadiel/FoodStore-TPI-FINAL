from sqlmodel import select

from app.core.database import create_db_and_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.db.models import Usuario, Categoria, Producto
from app.modules.usuarios.model import Rol


DATOS = {
    "Hamburguesas": [
        ("Hamburguesa clasica", 6500, 30),
        ("Hamburguesa doble", 8500, 25),
        ("Hamburguesa especial", 9500, 20),
    ],
    "Pizzas": [
        ("Pizza muzzarella", 8000, 30),
        ("Pizza napolitana", 9500, 25),
        ("Pizza especial", 11000, 20),
    ],
    "Bebidas": [
        ("Coca Cola 500ml", 2500, 50),
        ("Agua mineral 500ml", 1500, 50),
        ("Jugo de naranja", 2200, 35),
    ],
}


def seed() -> None:
    create_db_and_tables()

    with UnitOfWork() as uow:
        session = uow.session

        admin = session.exec(
            select(Usuario).where(
                Usuario.username == "admin"
            )
        ).first()

        if admin is None:
            uow.usuarios.add(
                Usuario(
                    username="admin",
                    full_name="Administrador Food Store",
                    email="admin@example.com",
                    hashed_password=hash_password("Admin1234!"),
                    role=Rol.ADMIN,
                    disabled=False,
                )
            )

        for nombre, productos in DATOS.items():
            categoria = session.exec(
                select(Categoria).where(
                    Categoria.nombre == nombre
                )
            ).first()

            if categoria is None:
                categoria = uow.categorias.add(
                    Categoria(
                        nombre=nombre,
                        descripcion=f"Catalogo de {nombre.lower()}",
                        activo=True,
                    )
                )

            for nombre_producto, precio, stock in productos:
                existente = session.exec(
                    select(Producto).where(
                        Producto.nombre == nombre_producto,
                        Producto.categoria_id == categoria.id,
                    )
                ).first()

                if existente is None:
                    uow.productos.add(
                        Producto(
                            categoria_id=categoria.id,
                            nombre=nombre_producto,
                            descripcion=nombre_producto,
                            precio_base=precio,
                            imagen_url="",
                            stock=stock,
                            disponible=True,
                            activo=True,
                        )
                    )

    print("SEED COMPLETADO CORRECTAMENTE")


if __name__ == "__main__":
    seed()
