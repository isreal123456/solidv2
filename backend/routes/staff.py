from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from models import Staff
from schemas import CreateStaffRequest, UpdateStaffPinRequest
from utils.auth import require_user
from utils.helpers import append_log, find_staff_by_id, find_staff_by_name, make_id, raise_api_error, staff_public_dict


router = APIRouter(prefix="/api/v1/staff", tags=["Staff"])


@router.get("")
def get_staff(_: dict = Depends(require_user), db: Session = Depends(get_db)):
    return [staff_public_dict(item) for item in db.query(Staff).all()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_staff(payload: CreateStaffRequest, _: dict = Depends(require_user), db: Session = Depends(get_db)):
    exists = find_staff_by_name(db, payload.name)
    if exists is not None:
        raise_api_error(status.HTTP_409_CONFLICT, "Staff already exists")

    new_staff = Staff(id=make_id("staff"), name=payload.name, pin=payload.pin, role=payload.role)
    db.add(new_staff)

    append_log(db, payload.name, "staff.create", f"Created staff {payload.name}")
    db.commit()
    return staff_public_dict(new_staff)


@router.delete("/{staff_id}")
def delete_staff(staff_id: str, _: dict = Depends(require_user), db: Session = Depends(get_db)):
    existing = find_staff_by_id(db, staff_id)
    if existing is None:
        raise_api_error(status.HTTP_404_NOT_FOUND, "Staff not found")

    db.delete(existing)
    append_log(db, existing.name, "staff.delete", f"Deleted staff {existing.name}")
    db.commit()
    return {"success": True}


@router.patch("/{staff_id}/pin")
def update_staff_pin(staff_id: str, payload: UpdateStaffPinRequest, _: dict = Depends(require_user), db: Session = Depends(get_db)):
    existing = find_staff_by_id(db, staff_id)
    if existing is None:
        raise_api_error(status.HTTP_404_NOT_FOUND, "Staff not found")

    existing.pin = payload.newPin
    append_log(db, existing.name, "staff.pin.update", f"Updated PIN for {existing.name}")
    db.commit()
    return staff_public_dict(existing)
