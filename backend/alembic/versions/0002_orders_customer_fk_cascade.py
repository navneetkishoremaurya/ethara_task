"""orders customer fk cascade

Revision ID: 0002_orders_customer_fk_cascade
Revises: 0001_init
Create Date: 2026-06-01
"""

from __future__ import annotations

from alembic import op


revision = "0002_orders_customer_fk_cascade"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop old FK and recreate with ON DELETE CASCADE.
    op.drop_constraint("orders_customer_id_fkey", "orders", type_="foreignkey")
    op.create_foreign_key(
        "orders_customer_id_fkey",
        "orders",
        "customers",
        ["customer_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("orders_customer_id_fkey", "orders", type_="foreignkey")
    op.create_foreign_key(
        "orders_customer_id_fkey",
        "orders",
        "customers",
        ["customer_id"],
        ["id"],
        ondelete="RESTRICT",
    )

