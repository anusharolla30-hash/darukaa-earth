from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Analytics(Base):
    __tablename__ = "analytics"

    id: Mapped[int] = mapped_column(primary_key=True)

    site_id: Mapped[int] = mapped_column(
        ForeignKey("sites.id"),
        nullable=False
    )

    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    carbon_value: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    biodiversity_value: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    site: Mapped["Site"] = relationship(
        back_populates="analytics"
    )