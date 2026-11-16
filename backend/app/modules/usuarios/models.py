from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.core.database import utcnow


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user")
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")  # noqa: F821
