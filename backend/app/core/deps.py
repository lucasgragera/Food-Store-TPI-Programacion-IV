from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.database import session_factory
from app.core.security import decode_access_token


def get_current_user(access_token: Annotated[str | None, Cookie()] = None):
    """Lee la cookie HttpOnly, valida firma/expiracion y carga el usuario."""
    from app.modules.usuarios.models import Usuario

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
    )
    if not access_token:
        raise credentials_exception
    payload = decode_access_token(access_token)
    if payload is None or not payload.get("sub"):
        raise credentials_exception
    with session_factory() as session:
        from sqlmodel import select

        user = session.exec(
            select(Usuario).where(Usuario.username == payload["sub"])
        ).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(user=Depends(get_current_user)):
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return user


def require_role(roles: list[str]):
    def checker(user=Depends(get_current_active_user)):
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta accion",
            )
        return user

    return checker
