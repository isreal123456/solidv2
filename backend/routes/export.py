from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Drink, LogEntry, Sale, Staff
from utils.auth import require_user
from utils.helpers import drink_dict, get_settings_map, log_dict, sale_dict, staff_public_dict


router = APIRouter(prefix="/api/v1/export", tags=["Export"])


@router.get("/snapshot")
def export_snapshot(_: dict = Depends(require_user), db: Session = Depends(get_db)):
    return {
        "settings": get_settings_map(db),
        "staff": [staff_public_dict(item) for item in db.query(Staff).all()],
        "drinks": [drink_dict(item) for item in db.query(Drink).all()],
        "sales": [sale_dict(item) for item in db.query(Sale).all()],
        "logs": [log_dict(item) for item in db.query(LogEntry).all()],
    }
