from __future__ import annotations

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Staff(Base):
    __tablename__ = "staff"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    pin: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String)


class Drink(Base):
    __tablename__ = "drinks"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    category: Mapped[str] = mapped_column(String)
    price: Mapped[int] = mapped_column(Integer)
    stock: Mapped[int] = mapped_column(Integer)
    alertLevel: Mapped[int] = mapped_column(Integer)
    isActive: Mapped[bool] = mapped_column(Boolean, default=True)


class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    staffId: Mapped[str] = mapped_column(String, index=True)
    staffName: Mapped[str] = mapped_column(String)
    customerName: Mapped[str | None] = mapped_column(String, nullable=True)
    drinkId: Mapped[str] = mapped_column(String, index=True)
    drinkName: Mapped[str] = mapped_column(String)
    quantity: Mapped[int] = mapped_column(Integer)
    price: Mapped[int] = mapped_column(Integer)
    total: Mapped[int] = mapped_column(Integer)
    date: Mapped[str] = mapped_column(String, index=True)
    time: Mapped[str] = mapped_column(String)


class LogEntry(Base):
    __tablename__ = "logs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    staffName: Mapped[str] = mapped_column(String, index=True)
    action: Mapped[str] = mapped_column(String, index=True)
    details: Mapped[str] = mapped_column(Text)
    date: Mapped[str] = mapped_column(String, index=True)
    time: Mapped[str] = mapped_column(String)


class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    value: Mapped[str] = mapped_column(Text)


class AuthToken(Base):
    __tablename__ = "auth_tokens"

    token: Mapped[str] = mapped_column(String, primary_key=True)
    staffId: Mapped[str] = mapped_column(String, index=True)
