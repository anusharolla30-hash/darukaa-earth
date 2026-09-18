from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate
from app.services.dependencies import get_current_user


project_sites_router = APIRouter(
    prefix="/projects",
    tags=["Sites"]
)

sites_router = APIRouter(
    prefix="/sites",
    tags=["Sites"]
)


@project_sites_router.post("/{project_id}/sites")
def create_site(
    project_id: int,
    site_data: SiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    try:
        from shapely.geometry import shape
        from geoalchemy2.shape import from_shape

        polygon = shape(site_data.geometry)

        if polygon.geom_type != "Polygon":
            raise HTTPException(
                status_code=400,
                detail="Geometry must be a Polygon"
            )

        geometry = from_shape(
            polygon,
            srid=4326
        )

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid polygon geometry"
        )

    new_site = Site(
        name=site_data.name,
        description=site_data.description,
        project_id=project_id,
        geometry=geometry
    )

    db.add(new_site)
    db.commit()
    db.refresh(new_site)

    return {
        "message": "Site created successfully",
        "site_id": new_site.id,
        "project_id": new_site.project_id,
        "name": new_site.name,
        "description": new_site.description
    }


@project_sites_router.get("/{project_id}/sites")
def get_sites(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    sites = db.query(
        Site,
        func.ST_AsGeoJSON(Site.geometry).label("geometry")
    ).filter(
        Site.project_id == project_id
    ).all()

    return [
        {
            "site_id": site.id,
            "project_id": site.project_id,
            "name": site.name,
            "description": site.description,
            "created_at": site.created_at,
            "geometry": geometry
        }
        for site, geometry in sites
    ]


@sites_router.get("/{site_id}")
def get_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = db.query(
        Site,
        func.ST_AsGeoJSON(Site.geometry).label("geometry")
    ).join(
        Project,
        Site.project_id == Project.id
    ).filter(
        Site.id == site_id,
        Project.user_id == current_user.id
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Site not found"
        )

    site, geometry = result

    return {
        "site_id": site.id,
        "project_id": site.project_id,
        "name": site.name,
        "description": site.description,
        "created_at": site.created_at,
        "geometry": geometry
    }