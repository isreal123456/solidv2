from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import LogEntry
from utils.auth import require_user
from utils.helpers import log_dict


router = APIRouter(prefix="/api/v1/logs", tags=["Logs"])


@router.get("")
def get_logs(
    staffName: Optional[str] = Query(default=None),
    action: Optional[str] = Query(default=None),
    date: Optional[str] = Query(default=None),
    fromDate: Optional[str] = Query(default=None),
    toDate: Optional[str] = Query(default=None),
    _: dict = Depends(require_user),
    db: Session = Depends(get_db),
):
    query = db.query(LogEntry)

    if staffName:
        query = query.filter(LogEntry.staffName.ilike(staffName))
    if action:
        query = query.filter(LogEntry.action.ilike(action))
    if date:
        query = query.filter(LogEntry.date == date)
    if fromDate:
        query = query.filter(LogEntry.date >= fromDate)
    if toDate:
        query = query.filter(LogEntry.date <= toDate)

    return [log_dict(item) for item in query.all()]
