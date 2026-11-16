from collections.abc import Callable

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesion en __enter__; commit/rollback y close en __exit__."""

    def __init__(self, factory: Callable[[], Session] = session_factory):
        self._factory = factory
        self.session: Session | None = None

    def __enter__(self):
        self.session = self._factory()
        self._init_repositories(self.session)
        return self

    def _init_repositories(self, session: Session) -> None:
        """Las subclases crean aqui sus repositorios sobre la misma sesion."""

    def __exit__(self, exc_type, exc_val, exc_tb):
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False
