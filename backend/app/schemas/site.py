from pydantic import BaseModel


class SiteCreate(BaseModel):
    name: str
    description: str | None = None
    geometry: dict