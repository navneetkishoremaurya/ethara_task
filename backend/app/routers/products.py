from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, Response, status

from app.db.session import get_db
from app.errors import conflict, not_found
from app.models import Product
from app.schemas import ProductCreate, ProductOut, ProductUpdate


router = APIRouter(prefix="/products")


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> Product:
    product = Product(
        name=payload.name,
        sku=payload.sku,
        price=payload.price,
        quantity_in_stock=payload.quantity_in_stock,
    )
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise conflict("SKU must be unique")
    db.refresh(product)
    return product


@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)) -> list[Product]:
    return list(db.scalars(select(Product).order_by(Product.id.desc())).all())


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise not_found("Product")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise not_found("Product")

    if payload.name is not None:
        product.name = payload.name
    if payload.price is not None:
        product.price = payload.price
    if payload.quantity_in_stock is not None:
        product.quantity_in_stock = payload.quantity_in_stock

    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_product(product_id: int, db: Session = Depends(get_db)) -> Response:
    product = db.get(Product, product_id)
    if not product:
        raise not_found("Product")
    db.delete(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise conflict("Cannot delete product; delete orders that include it first")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
