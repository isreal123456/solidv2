from typing import List

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    name: str
    pin: str


class LogoutRequest(BaseModel):
    staffName: str


class CreateSaleRequest(BaseModel):
    staffId: str
    staffName: str
    customerName: str = Field(min_length=1, max_length=120)
    drinkId: str
    quantity: int = Field(gt=0)


class UpdateDrinkQuantityRequest(BaseModel):
    newQuantity: int = Field(ge=0)
    staffName: str


class UpdateDrinkAlertLevelRequest(BaseModel):
    alertLevel: int = Field(ge=0)
    staffName: str


class UpdateDrinkActiveRequest(BaseModel):
    isActive: bool
    staffName: str


class CreateDrinkRequest(BaseModel):
    name: str
    category: str
    price: int = Field(gt=0)
    stock: int = Field(ge=0)
    alertLevel: int = Field(ge=0)
    staffName: str


class CreateStaffRequest(BaseModel):
    name: str
    pin: str
    role: str


class UpdateStaffPinRequest(BaseModel):
    newPin: str


class UpdateShopNameRequest(BaseModel):
    shopName: str


class UpdateCategoriesRequest(BaseModel):
    categories: List[str]
