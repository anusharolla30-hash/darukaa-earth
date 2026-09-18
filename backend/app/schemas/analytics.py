from pydantic import BaseModel, Field


class AnalyticsCreate(BaseModel):
    year: int = Field(
        ge=2000,
        le=2100,
        description="Analytics year",
    )

    carbon_value: float = Field(
        ge=0,
        description="Carbon value",
    )

    biodiversity_value: float = Field(
        ge=0,
        description="Biodiversity value",
    )