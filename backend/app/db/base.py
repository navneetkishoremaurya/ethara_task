from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models so Alembic can detect them via Base.metadata
from app import models as _models  # noqa: E402,F401
