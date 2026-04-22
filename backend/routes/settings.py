import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import UpdateCategoriesRequest, UpdateShopNameRequest
from utils.auth import require_user
from utils.helpers import get_settings_map, set_setting


router = APIRouter(prefix="/api/v1/settings", tags=["Settings"])


@router.get("")
def get_settings(_: dict = Depends(require_user), db: Session = Depends(get_db)):
    return get_settings_map(db)


@router.patch("/shop-name")
def update_shop_name(payload: UpdateShopNameRequest, _: dict = Depends(require_user), db: Session = Depends(get_db)):
    set_setting(db, "shopName", payload.shopName)
    db.commit()
    return {"shopName": payload.shopName}


@router.patch("/categories")
def update_categories(payload: UpdateCategoriesRequest, _: dict = Depends(require_user), db: Session = Depends(get_db)):
    set_setting(db, "categories", json.dumps(payload.categories))
    db.commit()
    return {"categories": payload.categories}
