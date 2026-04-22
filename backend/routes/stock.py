from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import Drink
from schemas import CreateDrinkRequest, UpdateDrinkActiveRequest, UpdateDrinkAlertLevelRequest, UpdateDrinkQuantityRequest
from utils.auth import require_user
from utils.helpers import append_log, drink_dict, find_drink_by_id, make_id, raise_api_error


router = APIRouter(prefix="/api/v1/stock", tags=["Stock"])


@router.get("")
def get_stock(
    includeInactive: bool = Query(default=False),
    _: dict = Depends(require_user),
    db: Session = Depends(get_db),
):
    query = db.query(Drink)
    if not includeInactive:
        query = query.filter(Drink.isActive == True)  # noqa: E712
    return [drink_dict(item) for item in query.all()]


@router.patch("/{drink_id}/quantity")
def update_stock_quantity(drink_id: str, payload: UpdateDrinkQuantityRequest, _: dict = Depends(require_user), db: Session = Depends(get_db)):
    drink = find_drink_by_id(db, drink_id)
    if drink is None:
        raise_api_error(status.HTTP_404_NOT_FOUND, "Drink not found")

    drink.stock = payload.newQuantity
    append_log(db, payload.staffName, "stock.quantity.update", f"Set {drink.name} stock to {payload.newQuantity}")
    db.commit()
    return drink_dict(drink)


@router.patch("/{drink_id}/alert-level")
def update_stock_alert_level(drink_id: str, payload: UpdateDrinkAlertLevelRequest, _: dict = Depends(require_user), db: Session = Depends(get_db)):
    drink = find_drink_by_id(db, drink_id)
    if drink is None:
        raise_api_error(status.HTTP_404_NOT_FOUND, "Drink not found")

    drink.alertLevel = payload.alertLevel
    append_log(db, payload.staffName, "stock.alert.update", f"Set {drink.name} alert level to {payload.alertLevel}")
    db.commit()
    return drink_dict(drink)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_drink(payload: CreateDrinkRequest, _: dict = Depends(require_user), db: Session = Depends(get_db)):
    already_exists = db.query(Drink).filter(Drink.name.ilike(payload.name)).first()
    if already_exists is not None:
        raise_api_error(status.HTTP_409_CONFLICT, "Drink already exists")

    drink = Drink(
        id=make_id("drink"),
        name=payload.name,
        category=payload.category,
        price=payload.price,
        stock=payload.stock,
        alertLevel=payload.alertLevel,
        isActive=True,
    )
    db.add(drink)

    append_log(db, payload.staffName, "stock.create", f"Created drink {payload.name}")
    db.commit()
    return drink_dict(drink)


@router.patch("/{drink_id}/active")
def update_drink_active_status(
    drink_id: str,
    payload: UpdateDrinkActiveRequest,
    _: dict = Depends(require_user),
    db: Session = Depends(get_db),
):
    drink = find_drink_by_id(db, drink_id)
    if drink is None:
        raise_api_error(status.HTTP_404_NOT_FOUND, "Drink not found")

    drink.isActive = payload.isActive
    state_text = "activated" if payload.isActive else "deactivated"
    append_log(db, payload.staffName, "stock.active.update", f"{state_text.capitalize()} drink {drink.name}")
    db.commit()
    return drink_dict(drink)


@router.delete("/{drink_id}")
def delete_drink(drink_id: str, current_user=Depends(require_user), db: Session = Depends(get_db)):
    drink = find_drink_by_id(db, drink_id)
    if drink is None:
        raise_api_error(status.HTTP_404_NOT_FOUND, "Drink not found")

    drink_name = drink.name
    db.delete(drink)
    append_log(db, current_user.name, "stock.delete", f"Deleted drink {drink_name}")
    db.commit()
    return {"success": True, "message": "Drink deleted"}
