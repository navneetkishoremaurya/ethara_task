from __future__ import annotations

from fastapi import APIRouter

from app.routers.customers import router as customers_router
from app.routers.dashboard import router as dashboard_router
from app.routers.orders import router as orders_router
from app.routers.products import router as products_router


api_router = APIRouter()
api_router.include_router(products_router, tags=["products"])
api_router.include_router(customers_router, tags=["customers"])
api_router.include_router(orders_router, tags=["orders"])
api_router.include_router(dashboard_router, tags=["dashboard"])

