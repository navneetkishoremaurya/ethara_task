from __future__ import annotations

from collections import defaultdict
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from fastapi import APIRouter, Depends, Response, status

from app.db.session import get_db
from app.errors import bad_request, not_found
from app.models import Customer, Order, OrderItem, Product
from app.schemas import OrderCreate, OrderOut


router = APIRouter(prefix="/orders")


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> Order:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise not_found("Customer")

    # Merge duplicate product lines, if any
    requested: dict[int, int] = defaultdict(int)
    for item in payload.items:
        requested[item.product_id] += item.quantity

    product_ids = list(requested.keys())
    products = (
        db.execute(select(Product).where(Product.id.in_(product_ids)).with_for_update()).scalars().all()
        if product_ids
        else []
    )
    by_id = {p.id: p for p in products}
    missing = [pid for pid in product_ids if pid not in by_id]
    if missing:
        raise bad_request(f"Unknown product_id(s): {missing}")

    for pid, qty in requested.items():
        product = by_id[pid]
        if product.quantity_in_stock < qty:
            raise bad_request(f"Insufficient inventory for product_id={pid}")

    total = Decimal("0.00")
    order = Order(customer_id=customer.id, total_amount=Decimal("0.00"))
    db.add(order)
    db.flush()  # allocate order.id

    items: list[OrderItem] = []
    for pid, qty in requested.items():
        product = by_id[pid]
        unit_price = Decimal(product.price)
        line_total = (unit_price * qty).quantize(Decimal("0.01"))
        total += line_total
        product.quantity_in_stock -= qty
        items.append(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=qty,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    order.total_amount = total.quantize(Decimal("0.01"))
    db.add_all(items)
    db.commit()

    order = (
        db.execute(select(Order).options(joinedload(Order.items)).where(Order.id == order.id))
        .unique()
        .scalars()
        .one()
    )
    return order


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)) -> list[Order]:
    orders = (
        db.execute(select(Order).options(joinedload(Order.items)).order_by(Order.id.desc()))
        .unique()
        .scalars()
        .all()
    )
    return list(orders)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)) -> Order:
    order = (
        db.execute(select(Order).options(joinedload(Order.items)).where(Order.id == order_id))
        .unique()
        .scalars()
        .first()
    )
    if not order:
        raise not_found("Order")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_order(order_id: int, db: Session = Depends(get_db)) -> Response:
    order = db.execute(select(Order).where(Order.id == order_id).with_for_update()).scalars().first()
    if not order:
        raise not_found("Order")

    # Restore inventory on cancel/delete
    items = db.execute(select(OrderItem).where(OrderItem.order_id == order_id)).scalars().all()
    if items:
        product_ids = list({it.product_id for it in items})
        products = db.execute(select(Product).where(Product.id.in_(product_ids)).with_for_update()).scalars().all()
        by_id = {p.id: p for p in products}
        for it in items:
            p = by_id.get(it.product_id)
            if p is not None:
                p.quantity_in_stock += int(it.quantity)

    db.delete(order)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
