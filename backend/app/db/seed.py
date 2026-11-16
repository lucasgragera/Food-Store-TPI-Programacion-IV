"""Carga idempotente: admin, categorias y productos. Uso: python -m app.db.seed"""
from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales"),
    ("Pizzas", "Pizzas al horno de piedra"),
    ("Bebidas", "Gaseosas, jugos y aguas"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (nombre, descripcion, precio, stock, categoria)
PRODUCTOS = [
    ("Hamburguesa Clasica", "Carne, lechuga, tomate y cheddar", 6500.0, 30, "Hamburguesas"),
    ("Hamburguesa Doble", "Doble carne y doble cheddar", 8200.0, 25, "Hamburguesas"),
    ("Hamburguesa Veggie", "Medallon de garbanzos y palta", 7000.0, 20, "Hamburguesas"),
    ("Pizza Muzzarella", "Salsa de tomate y muzzarella", 9000.0, 20, "Pizzas"),
    ("Pizza Napolitana", "Muzzarella, tomate fresco y ajo", 10500.0, 15, "Pizzas"),
    ("Coca-Cola 500ml", "Gaseosa cola", 2200.0, 50, "Bebidas"),
    ("Agua Mineral 500ml", "Agua sin gas", 1500.0, 60, "Bebidas"),
    ("Flan con Dulce de Leche", "Flan casero con crema", 3500.0, 18, "Postres"),
    ("Brownie con Helado", "Brownie tibio con helado de crema", 4800.0, 12, "Postres"),
]


def run() -> None:
    create_all_tables()
    with session_factory() as session:
        if not session.exec(select(Usuario).where(Usuario.username == "admin")).first():
            session.add(
                Usuario(
                    username="admin",
                    full_name="Administrador",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                )
            )
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
                session.flush()
            categorias[nombre] = cat
        for nombre, descripcion, precio, stock, cat_nombre in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=f"https://placehold.co/600x400?text={nombre.replace(' ', '+')}",
                        categoria_id=categorias[cat_nombre].id,
                    )
                )
        session.commit()
    print("Seed completado.")


if __name__ == "__main__":
    run()
