import logging
import os
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    SECRET_KEY = secrets.token_urlsafe(32)
    logger.warning(
        "SECRET_KEY not set: generated an ephemeral signing key. "
        "Set SECRET_KEY in your environment for stable sessions in production."
    )
ALGORITHM = os.getenv("ALGORITHM", "HS256")


class TokenData(BaseModel):
    username: str | None = None
    roles: list[str] = Field(default_factory=list)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, roles=payload.get("roles", []))
    except JWTError:
        raise credentials_exception
    return {
        "id": token_data.username,
        "name": token_data.username,
        "roles": token_data.roles,
        "active": bool(payload.get("active", True)),
    }


async def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )
    return current_user
