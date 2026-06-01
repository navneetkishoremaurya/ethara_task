from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, Query

from app.db.session import get_db
from app.models import Customer, Order, Product
from app.schemas import DashboardOut, ProductOut


router = APIRouter(prefix="/dashboard")


@router.get("", response_model=DashboardOut)
def dashboard(low_stock_threshold: int = Query(default=5, ge=0), db: Session = Depends(get_db)) -> DashboardOut:
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0

    low_stock = (
        db.scalars(select(Product).where(Product.quantity_in_stock <= low_stock_threshold).order_by(Product.id.desc()))
        .all()
    )

    return DashboardOut(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=[ProductOut.model_validate(p) for p in low_stock],
    )

