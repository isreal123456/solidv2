from typing import Optional

from fastapi import Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
from models import AuthToken, Staff
from utils.helpers import raise_api_error


security = HTTPBearer(auto_error=False)


def require_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    if credentials is None:
        raise_api_error(status.HTTP_401_UNAUTHORIZED, "Unauthorized")

    token = credentials.credentials
    token_row = db.query(AuthToken).filter(AuthToken.token == token).first()
    if token_row is None:
        raise_api_error(status.HTTP_401_UNAUTHORIZED, "Unauthorized")

    user = db.query(Staff).filter(Staff.id == token_row.staffId).first()
    if user is None:
        raise_api_error(status.HTTP_401_UNAUTHORIZED, "Unauthorized")

    return user
