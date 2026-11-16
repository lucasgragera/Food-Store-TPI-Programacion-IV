from datetime import datetime, timezone

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def utcnow() -> datetime:
    """Fecha/hora UTC sin tzinfo (compatible con SQLite y PostgreSQL)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def create_all_tables() -> None:
    # Importar los modelos registra las tablas en SQLModel.metadata.
    from app.modules.categorias import models as _c  # noqa: F401
    from app.modules.pedidos import models as _p  # noqa: F401
    from app.modules.productos import models as _pr  # noqa: F401
    from app.modules.usuarios import models as _u  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)
