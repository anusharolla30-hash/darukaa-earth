# 🌍 Darukaa.Earth – Geospatial Carbon & Biodiversity Analytics Platform

Darukaa.Earth is a full-stack geospatial analytics platform designed for monitoring and managing carbon and biodiversity projects.

The application allows users to create projects, add multiple geographical sites by drawing polygons on an interactive map, store geographical data using PostGIS, and view carbon and biodiversity analytics for individual sites over time.

---

## 📌 Project Overview

Darukaa.Earth provides a centralized platform for managing environmental projects and their geographical sites.

Users can:

- Register and log in securely
- Create and manage projects
- Add multiple geographical sites to projects
- Draw site boundaries using polygons on an interactive map
- Store geographical data using PostgreSQL and PostGIS
- View project sites on an interactive Mapbox map
- Select individual sites to view their details
- View carbon and biodiversity analytics
- Add yearly analytics data
- Visualize performance trends using interactive charts

The project was developed as part of the Darukaa.Earth Full-Stack Developer Hackathon Challenge.

---

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- Password hashing using Argon2
- JWT-based authentication
- Protected API endpoints
- User-specific project access

### 📁 Project Management

- Create new projects
- View existing projects
- Select projects from the dashboard
- View project details
- Associate multiple geographical sites with a project

### 🗺️ Geospatial Mapping

- Interactive Mapbox map
- Draw polygon boundaries for sites
- Save drawn polygons
- Display saved site polygons on the map
- Click sites to view their information
- GeoJSON geometry support
- PostgreSQL PostGIS spatial storage

### 📊 Analytics

Each site can contain yearly:

- Carbon values
- Biodiversity values

Analytics are displayed using interactive Chart.js visualizations.

Example:

| Year | Carbon Value | Biodiversity Value |
|------|--------------|--------------------|
| 2021 | 120.5 | 65 |
| 2022 | 135.2 | 70 |
| 2023 | 148.7 | 74 |
| 2024 | 160.3 | 79 |
| 2025 | 175.8 | 83 |

### ➕ Add Analytics

Users can add new yearly analytics records for a site.

Validation includes:

- Year must be between 2000 and 2100
- Carbon value cannot be negative
- Biodiversity value cannot be negative
- Duplicate analytics for the same year and site are prevented

---

## 🛠️ Technologies Used

### Frontend

- React
- Vite
- JavaScript
- Axios
- Mapbox GL JS
- Mapbox GL Draw
- Chart.js
- React Chart.js 2
- ESLint

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PyJWT
- pwdlib
- Argon2
- Shapely
- GeoAlchemy2

### Database

- PostgreSQL
- PostGIS

### Development & Version Control

- Git
- GitHub
- GitHub Actions
- ESLint
- Prettier
- Environment Variables

---

## 📸 Screenshots

### 🔐 Login
![Login Page](https://github.com/anusharolla30-hash/darukaa-earth/raw/main/frontend/public/screenshots/login.png)

### 📊 Dashboard
![Dashboard](https://github.com/anusharolla30-hash/darukaa-earth/raw/main/frontend/public/screenshots/dashboard.png)

### 🗺️ Map & Sites
![Map and Sites](https://github.com/anusharolla30-hash/darukaa-earth/raw/main/frontend/public/screenshots/map-site.png)

### 📈 Analytics
![Analytics](https://github.com/anusharolla30-hash/darukaa-earth/raw/main/frontend/public/screenshots/analytics.png)

### 📊 Graph & Chart
![Graph and Chart](https://github.com/anusharolla30-hash/darukaa-earth/raw/main/frontend/public/screenshots/graphchart.png)

### ➕ Add Analytics
![Add Analytics](https://github.com/anusharolla30-hash/darukaa-earth/raw/main/frontend/public/screenshots/add-analytics.png)
---

## 📂 Project Structure

    darukaa-earth/
    │
    ├── frontend/
    │   ├── public/
    │   ├── src/
    │   │   ├── App.jsx
    │   │   ├── main.jsx
    │   │   └── ...
    │   ├── package.json
    │   ├── vite.config.js
    │   └── .env
    │
    ├── backend/
    │   ├── app/
    │   │   ├── models/
    │   │   │   ├── user.py
    │   │   │   ├── project.py
    │   │   │   ├── site.py
    │   │   │   └── analytics.py
    │   │   │
    │   │   ├── routes/
    │   │   │   ├── auth.py
    │   │   │   ├── projects.py
    │   │   │   ├── sites.py
    │   │   │   └── analytics.py
    │   │   │
    │   │   ├── schemas/
    │   │   │   ├── auth.py
    │   │   │   ├── project.py
    │   │   │   ├── site.py
    │   │   │   └── analytics.py
    │   │   │
    │   │   ├── services/
    │   │   │   ├── auth.py
    │   │   │   └── dependencies.py
    │   │   │
    │   │   ├── database.py
    │   │   └── models/__init__.py
    │   │
    │   ├── init_db.py
    │   ├── main.py
    │   ├── requirements.txt
    │   └── .env
    │
    ├── .github/
    │   └── workflows/
    │
    ├── .gitignore
    └── README.md

---

# 🚀 Installation & Setup

## 1. Prerequisites

Install:

- Node.js
- npm
- Python 3.11
- PostgreSQL
- PostGIS
- Git

Check versions:

    node --version
    npm --version
    python --version
    psql --version
    git --version

---

## 2. Clone the Repository

    git clone https://github.com/anusharolla30-hash/darukaa-earth.git
    cd darukaa-earth

---

## 3. Backend Setup

Move into the backend directory:

    cd backend

Create a virtual environment:

    python -m venv venv

Activate it:

    .\venv\Scripts\Activate.ps1

Install dependencies:

    pip install -r requirements.txt

---

## 4. Configure Backend Environment Variables

Create:

    backend/.env

Add:

    DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/darukaa_earth
    SECRET_KEY=your-development-secret-key

Replace YOUR_PASSWORD with your PostgreSQL password.

Do not upload the .env file to GitHub.

---

## 5. Create PostgreSQL Database

Open PostgreSQL:

    psql -U postgres

Create the database:

    CREATE DATABASE darukaa_earth;

Connect to it:

    \c darukaa_earth

Enable PostGIS:

    CREATE EXTENSION postgis;

Verify PostGIS:

    SELECT PostGIS_Full_Version();

Exit PostgreSQL:

    \q

---

## 6. Initialize Database Tables

From the backend directory:

    python init_db.py

This creates:

- users
- projects
- sites
- analytics

---

## 7. Start the Backend

From the backend directory:

    python -m uvicorn main:app --host 127.0.0.1 --port 8000

Backend URL:

    http://127.0.0.1:8000

FastAPI documentation:

    http://127.0.0.1:8000/docs

---

## 8. Frontend Setup

Open another terminal.

Move into the frontend directory:

    cd frontend

Install dependencies:

    npm install

---

## 9. Configure Frontend Environment Variables

Create:

    frontend/.env

Add:

    VITE_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN
    VITE_API_URL=http://127.0.0.1:8000

Replace YOUR_MAPBOX_TOKEN with your Mapbox access token.

Do not upload the .env file to GitHub.

---

## 10. Start the Frontend

From the frontend directory:

    npm run dev

Open:

    http://localhost:5173

---

## 🔑 Demo Credentials

For local demonstration, a user can register through the registration page.

Example test account:

    Email: user@example.com
    Password: string

Credentials are intended for local demonstration only.

---

# 🔄 Project Workflow

    User
     │
     ▼
    Register / Login
     │
     ▼
    JWT Authentication
     │
     ▼
    Dashboard
     │
     ├──────────────────┐
     ▼                  ▼
    Create Project    Select Project
     │                  │
     └────────┬─────────┘
              ▼
         Project Sites
              │
              ▼
       Draw Polygon on Map
              │
              ▼
           Save Site
              │
              ▼
       PostgreSQL + PostGIS
              │
              ▼
         Select Site
              │
              ▼
        View Site Details
              │
              ▼
         View Analytics
              │
              ▼
    Carbon + Biodiversity Charts
              │
              ▼
       Add Yearly Analytics

---

# 🗺️ Geospatial Workflow

The application uses Mapbox GL JS and Mapbox GL Draw for geographical site creation.

    User selects project
            ↓
    User draws polygon on Mapbox
            ↓
    Polygon converted to GeoJSON
            ↓
    GeoJSON sent to FastAPI
            ↓
    Shapely processes geometry
            ↓
    GeoAlchemy2 converts geometry
            ↓
    PostGIS stores POLYGON geometry
            ↓
    API returns GeoJSON
            ↓
    Mapbox displays saved site

Coordinate system:

    SRID: 4326

---

# 🗄️ Database

The project uses PostgreSQL with PostGIS.

## Users Table

| Column | Type |
|--------|------|
| id | Integer |
| name | VARCHAR |
| email | VARCHAR |
| password | VARCHAR |
| created_at | Timestamp |

## Projects Table

| Column | Type |
|--------|------|
| id | Integer |
| name | VARCHAR |
| description | TEXT |
| created_at | Timestamp |
| user_id | Foreign Key |

## Sites Table

| Column | Type |
|--------|------|
| id | Integer |
| name | VARCHAR |
| description | TEXT |
| created_at | Timestamp |
| project_id | Foreign Key |
| geometry | POLYGON |

## Analytics Table

| Column | Type |
|--------|------|
| id | Integer |
| site_id | Foreign Key |
| year | Integer |
| carbon_value | Float |
| biodiversity_value | Float |

---

# 🔗 Database Relationships

    User
     │
     │ 1
     ▼
    Projects
     │
     │ 1
     ▼
    Sites
     │
     │ 1
     ▼
    Analytics

- One user can have multiple projects.
- One project can have multiple geographical sites.
- One site can have multiple yearly analytics records.

---

# 🔌 API Endpoints

## Authentication

### Register

    POST /auth/register

### Login

    POST /auth/login

---

## Projects

### Create Project

    POST /projects/

### Get User Projects

    GET /projects/

### Get Project

    GET /projects/{project_id}

---

## Sites

### Create Site

    POST /projects/{project_id}/sites

### Get Project Sites

    GET /projects/{project_id}/sites

### Get Individual Site

    GET /sites/{site_id}

---

## Analytics

### Add Analytics

    POST /sites/{site_id}/analytics

### Get Site Analytics

    GET /sites/{site_id}/analytics

---

# ✅ API Validation

The backend validates incoming data using Pydantic.

Analytics validation includes:

- Year must be between 2000 and 2100
- Carbon value must be greater than or equal to 0
- Biodiversity value must be greater than or equal to 0
- Duplicate analytics for the same site and year are prevented

Project and site ownership are checked before protected operations.

---

# 🔐 Security

The application implements:

- JWT authentication
- Password hashing using Argon2
- Protected backend routes
- User-specific project access
- Project and site ownership validation
- Environment variables for secrets
- .env excluded from Git
- Input validation using Pydantic

Passwords are never stored as plain text.

---

# 📊 Mock Dataset

The challenge allows the use of mock or sensible datasets.

Darukaa.Earth uses sample environmental analytics data for demonstration purposes.

Example:

    Site: Amazon Forest Site 1

    Year     Carbon     Biodiversity
    2021     120.5      65
    2022     135.2      70
    2023     148.7      74
    2024     160.3      79
    2025     175.8      83

The sample data is used to demonstrate:

- Year-wise performance
- Carbon trends
- Biodiversity trends
- Chart visualization
- Analytics data entry

The dataset is intended for demonstration purposes and does not represent real environmental measurements.

---

# 🧩 Main Application Components

### Login

Handles user authentication.

### Dashboard

Provides project and site management.

### Project Management

Allows users to create and select projects.

### Mapbox Map

Displays geographical project sites.

### Polygon Drawing

Allows users to draw site boundaries.

### Site Details

Displays information about the selected geographical site.

### Analytics Panel

Displays carbon and biodiversity performance.

### Analytics Form

Allows users to add yearly analytics data.

---

# 🧪 Local Testing

Frontend:

    http://localhost:5173

Backend:

    http://127.0.0.1:8000

FastAPI Swagger:

    http://127.0.0.1:8000/docs

---

# 📦 Code Quality

The project uses:

- ESLint
- Prettier
- Git
- Environment variables
- Structured React application
- Structured FastAPI routes
- SQLAlchemy models
- Pydantic schemas

The backend separates:

    Models
    Routes
    Schemas
    Services
    Database

---

# 🔄 CI/CD

GitHub is used for source-code management.

The project includes the .github/workflows/ directory for GitHub Actions configuration.

The project was prepared with the CI/CD requirements of the hackathon challenge in mind.

Public automated deployment was not completed in the final version, so the application is demonstrated locally.

---

# 🌐 Deployment Status

The final version is configured for local development and demonstration.

Frontend:

    http://localhost:5173

Backend:

    http://127.0.0.1:8000

Database:

    PostgreSQL + PostGIS

Public deployment was not completed in the final submitted version.

Therefore, no public live-demo URL is claimed.

---

# 🐙 GitHub Repository

Repository:

https://github.com/anusharolla30-hash/darukaa-earth

The repository contains:

- React frontend
- FastAPI backend
- PostgreSQL/PostGIS integration
- JWT authentication
- Project management
- Site management
- Geospatial functionality
- Analytics
- Environment configuration
- GitHub workflow configuration
- Documentation

---

# 📋 Challenge Requirements Covered

- [x] User registration
- [x] User login
- [x] JWT authentication
- [x] Project creation
- [x] Multiple sites per project
- [x] Interactive Mapbox map
- [x] Polygon drawing
- [x] Geographic site storage
- [x] PostgreSQL
- [x] PostGIS
- [x] Site selection
- [x] Site details
- [x] Carbon analytics
- [x] Biodiversity analytics
- [x] Year-wise analytics
- [x] Chart visualization
- [x] API validation
- [x] User ownership protection
- [x] GitHub repository
- [x] README documentation
- [x] Mock dataset documentation

Public deployment and completed automated deployment were not included in the final local-demo version.

---

# ⭐ Project Highlights

- Full-stack React + FastAPI application
- Geospatial site management
- Interactive Mapbox mapping
- Polygon drawing and storage
- PostgreSQL + PostGIS integration
- JWT authentication
- Secure password hashing
- Carbon and biodiversity analytics
- Interactive Chart.js visualization
- Structured backend architecture
- API validation
- User-specific data access
- Demonstration dataset for environmental analytics

---

# 🔮 Future Scope

Possible future improvements include:

- Integration with real environmental datasets
- Satellite imagery integration
- Automated carbon calculations
- Advanced biodiversity indicators
- Remote sensing analysis
- More detailed geospatial analytics
- Cloud deployment
- Automated CI/CD deployment
- Role-based administration
- Advanced reporting and exports

---

# 👩‍💻 Developer

**Anusha Rolla**

BE Computer Engineering

Ajeenkya DY Patil School Of Engineering (ADYPSOE)

GitHub:

https://github.com/anusharolla30-hash

---

# 🎯 Conclusion

Darukaa.Earth demonstrates a full-stack geospatial analytics solution for environmental projects.

The application combines:

    React
       +
    FastAPI
       +
    PostgreSQL
       +
    PostGIS
       +
    Mapbox
       +
    Chart.js
       +
    JWT Authentication

to provide project management, geographical site mapping, and carbon/biodiversity analytics in a single platform.

The system provides a practical foundation for managing environmental project data and visualizing site-level performance over time.