from fastapi import HTTPException, status

from app.modules.auth.schemas import UserPublic
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork | None = None):
        self.uow = uow or UsuarioUnitOfWork()

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def _get(self, uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
        return usuario

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._get(uow, usuario_id)
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._get(uow, usuario_id)
            if usuario.id == admin_id:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "Un administrador no puede desactivarse a si mismo"
                )
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
