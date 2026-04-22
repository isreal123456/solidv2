from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import Sale
from schemas import CreateSaleRequest
from utils.auth import require_user
from utils.helpers import append_log, find_drink_by_id, find_staff_by_id, make_id, now_date, now_time, raise_api_error, sale_dict


router = APIRouter(prefix="/api/v1/sales", tags=["Sales"])


@router.get("")
def get_sales(
    staffName: Optional[str] = Query(default=None),
    drinkName: Optional[str] = Query(default=None),
    date: Optional[str] = Query(default=None),
    fromDate: Optional[str] = Query(default=None),
    toDate: Optional[str] = Query(default=None),
    current_user=Depends(require_user),
    db: Session = Depends(get_db),
):
    query = db.query(Sale)

    # Staff users are always restricted to their own records.
    if getattr(current_user, "role", "") == "staff":
        query = query.filter(Sale.staffId == current_user.id)
    elif staffName:
        query = query.filter(Sale.staffName.ilike(staffName))
    if drinkName:
        query = query.filter(Sale.drinkName.ilike(drinkName))
    if date:
        query = query.filter(Sale.date == date)
    if fromDate:
        query = query.filter(Sale.date >= fromDate)
    if toDate:
        query = query.filter(Sale.date <= toDate)

    return [sale_dict(item) for item in query.all()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_sale(payload: CreateSaleRequest, _: dict = Depends(require_user), db: Session = Depends(get_db)):
    staff_user = find_staff_by_id(db, payload.staffId)
    if staff_user is None:
        raise_api_error(status.HTTP_404_NOT_FOUND, "Staff not found")

    drink = find_drink_by_id(db, payload.drinkId)
    if drink is None:
        raise_api_error(status.HTTP_404_NOT_FOUND, "Drink not found")

    if drink.stock < payload.quantity:
        raise_api_error(status.HTTP_409_CONFLICT, "Insufficient stock")

    drink.stock -= payload.quantity
    sale = Sale(
        id=make_id("sale"),
        staffId=payload.staffId,
        staffName=payload.staffName,
        customerName=payload.customerName.strip(),
        drinkId=drink.id,
        drinkName=drink.name,
        quantity=payload.quantity,
        price=drink.price,
        total=drink.price * payload.quantity,
        date=now_date(),
        time=now_time(),
    )
    db.add(sale)

    append_log(db, payload.staffName, "sale.create", f"Sold {payload.quantity} x {drink.name}")
    db.commit()
    return sale_dict(sale)
