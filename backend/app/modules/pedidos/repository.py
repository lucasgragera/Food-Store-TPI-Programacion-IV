from datetime import datetime

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def list_paginado(
        self,
        skip: int,
        limit: int,
        estado: str | None = None,
        usuario_id: int | None = None,
    ) -> tuple[list[Pedido], int]:
        filtros = []
        if estado:
            filtros.append(Pedido.estado == estado)
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        items = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def list_by_usuario(self, usuario_id: int, skip: int = 0, limit: int = 20):
        return self.list_paginado(skip, limit, usuario_id=usuario_id)

    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in rows}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_por_estado(self, estado: str) -> float:
        total = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == estado)
        ).one()
        return float(total)
