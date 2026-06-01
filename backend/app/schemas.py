from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field, PositiveInt, condecimal, constr


class ProductCreate(BaseModel):
    name: constr(min_length=1, max_length=200)
    sku: constr(min_length=1, max_length=64)
    price: condecimal(gt=0, max_digits=12, decimal_places=2)
    quantity_in_stock: int = Field(default=0, ge=0)


class ProductUpdate(BaseModel):
    name: constr(min_length=1, max_length=200) | None = None
    price: condecimal(gt=0, max_digits=12, decimal_places=2) | None = None
    quantity_in_stock: int | None = Field(default=None, ge=0)


class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    price: Decimal
    quantity_in_stock: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CustomerCreate(BaseModel):
    full_name: constr(min_length=1, max_length=200)
    email: EmailStr
    phone: constr(min_length=3, max_length=32)


class CustomerOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: PositiveInt


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    created_at: datetime
    items: list[OrderItemOut]

    model_config = {"from_attributes": True}


class DashboardOut(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[ProductOut]

