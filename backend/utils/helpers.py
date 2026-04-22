from datetime import datetime
import json
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models import Drink, LogEntry, Setting, Staff


def now_date() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def now_time() -> str:
    return datetime.now().strftime("%I:%M %p")


def make_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}"


def raise_api_error(code: int, message: str) -> None:
    raise HTTPException(status_code=code, detail={"message": message})


def find_staff_by_name(db: Session, name: str):
    return db.query(Staff).filter(Staff.name.ilike(name)).first()


def find_staff_by_id(db: Session, staff_id: str):
    return db.query(Staff).filter(Staff.id == staff_id).first()


def find_drink_by_id(db: Session, drink_id: str):
    return db.query(Drink).filter(Drink.id == drink_id).first()


def append_log(db: Session, staff_name: str, action: str, details: str) -> None:
    db.add(
        LogEntry(
            id=make_id("log"),
            staffName=staff_name,
            action=action,
            details=details,
            date=now_date(),
            time=now_time(),
        )
    )


def staff_public_dict(staff: Staff) -> dict:
    return {"id": staff.id, "name": staff.name, "role": staff.role}


def drink_dict(drink: Drink) -> dict:
    return {
        "id": drink.id,
        "name": drink.name,
        "category": drink.category,
        "price": drink.price,
        "stock": drink.stock,
        "alertLevel": drink.alertLevel,
        "isActive": bool(getattr(drink, "isActive", True)),
    }


def sale_dict(sale) -> dict:
    return {
        "id": sale.id,
        "staffId": sale.staffId,
        "staffName": sale.staffName,
        "customerName": sale.customerName or "",
        "drinkId": sale.drinkId,
        "drinkName": sale.drinkName,
        "quantity": sale.quantity,
        "price": sale.price,
        "total": sale.total,
        "date": sale.date,
        "time": sale.time,
    }


def log_dict(log: LogEntry) -> dict:
    return {
        "id": log.id,
        "staffName": log.staffName,
        "action": log.action,
        "details": log.details,
        "date": log.date,
        "time": log.time,
    }


def get_settings_map(db: Session) -> dict:
    shop_name_row = db.query(Setting).filter(Setting.key == "shopName").first()
    categories_row = db.query(Setting).filter(Setting.key == "categories").first()
    return {
        "shopName": shop_name_row.value if shop_name_row else "",
        "categories": json.loads(categories_row.value) if categories_row and categories_row.value else [],
    }


def set_setting(db: Session, key: str, value) -> None:
    row = db.query(Setting).filter(Setting.key == key).first()
    if row is None:
        db.add(Setting(key=key, value=value))
        return
    row.value = value
