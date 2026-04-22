from uuid import uuid4

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from models import AuthToken
from schemas import LoginRequest, LogoutRequest
from utils.auth import require_user
from utils.helpers import append_log, find_staff_by_name, raise_api_error, staff_public_dict


router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = find_staff_by_name(db, payload.name)
    if user is None or user.pin != payload.pin:
        raise_api_error(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    token = f"token-{uuid4().hex}"
    db.query(AuthToken).filter(AuthToken.staffId == user.id).delete()
    db.add(AuthToken(token=token, staffId=user.id))
    db.commit()
    return {
        "user": staff_public_dict(user),
        "token": token,
    }


@router.post("/logout")
def logout(payload: LogoutRequest, user=Depends(require_user), db: Session = Depends(get_db)):
    db.query(AuthToken).filter(AuthToken.staffId == user.id).delete()
    append_log(db, payload.staffName, "auth.logout", f"{payload.staffName} logged out")
    db.commit()
    return {"success": True}
