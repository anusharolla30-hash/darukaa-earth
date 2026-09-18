from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.site import Site
from app.models.project import Project
from app.models.analytics import Analytics
from app.models.user import User
from app.schemas.analytics import AnalyticsCreate
from app.services.dependencies import get_current_user

router = APIRouter(prefix="/sites", tags=["Analytics"])


@router.post("/{site_id}/analytics")
def create_analytics(
    site_id: int,
    analytics_data: AnalyticsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = (
        db.query(Site)
        .join(Project, Site.project_id == Project.id)
        .filter(
            Site.id == site_id,
            Project.user_id == current_user.id,
        )
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=404,
            detail="Site not found",
        )

    existing_analytics = (
        db.query(Analytics)
        .filter(
            Analytics.site_id == site_id,
            Analytics.year == analytics_data.year,
        )
        .first()
    )

    if existing_analytics:
        raise HTTPException(
            status_code=400,
            detail="Analytics for this year already exists for this site",
        )

    new_analytics = Analytics(
        site_id=site_id,
        year=analytics_data.year,
        carbon_value=analytics_data.carbon_value,
        biodiversity_value=analytics_data.biodiversity_value,
    )

    db.add(new_analytics)
    db.commit()
    db.refresh(new_analytics)

    return {
        "message": "Analytics data created successfully",
        "analytics_id": new_analytics.id,
        "site_id": new_analytics.site_id,
        "year": new_analytics.year,
        "carbon_value": new_analytics.carbon_value,
        "biodiversity_value": new_analytics.biodiversity_value,
    }


@router.get("/{site_id}/analytics")
def get_analytics(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    site = (
        db.query(Site)
        .join(Project, Site.project_id == Project.id)
        .filter(
            Site.id == site_id,
            Project.user_id == current_user.id,
        )
        .first()
    )

    if not site:
        raise HTTPException(
            status_code=404,
            detail="Site not found",
        )

    analytics = (
        db.query(Analytics)
        .filter(Analytics.site_id == site_id)
        .order_by(Analytics.year)
        .all()
    )

    return [
        {
            "analytics_id": data.id,
            "site_id": data.site_id,
            "year": data.year,
            "carbon_value": data.carbon_value,
            "biodiversity_value": data.biodiversity_value,
        }
        for data in analytics
    ]