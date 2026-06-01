from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, Response, status

from app.db.session import get_db
from app.errors import conflict, not_found
from app.models import Customer
from app.schemas import CustomerCreate, CustomerOut


router = APIRouter(prefix="/customers")


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)) -> Customer:
    customer = Customer(full_name=payload.full_name, email=str(payload.email).lower(), phone=payload.phone)
    db.add(customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise conflict("Customer email must be unique")
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerOut])
def list_customers(db: Session = Depends(get_db)) -> list[Customer]:
    return list(db.scalars(select(Customer).order_by(Customer.id.desc())).all())


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise not_found("Customer")
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_customer(customer_id: int, db: Session = Depends(get_db)) -> Response:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise not_found("Customer")
    db.delete(customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise conflict("Cannot delete customer; delete their orders first")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
