from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from app.routes.sites import (
    project_sites_router,
    sites_router
)
from app.routes.analytics import router as analytics_router


app = FastAPI(
    title="Darukaa.Earth API",
    description="Geospatial data analytics platform for carbon and biodiversity projects",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(project_sites_router)
app.include_router(sites_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    return {
        "message": "Darukaa.Earth API is running"
    }