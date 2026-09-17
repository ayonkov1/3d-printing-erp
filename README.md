# 3D Printing ERP

A full-stack ERP system for managing 3D printing supplies and operations.

## Getting Started

### Using Docker (Recommended)

Build and start all services:

```bash
docker compose up --build -d
```

The application will be available at:

-   Frontend: http://localhost:3000
-   Backend API: http://localhost:3000/api

Stop services:

```bash
docker compose down
```

## Technologies & Architecture

### Frontend

-   **React 18** - UI library
-   **TypeScript** - Type-safe JavaScript
-   **Vite** - Build tool and dev server
-   **TailwindCSS** - Utility-first CSS framework
-   **TanStack Query (React Query)** - Data fetching and state management
-   **React Hook Form** - Form validation and handling
-   **Zod** - TypeScript-first schema validation
-   **React Router v6** - Client-side routing
-   **Axios** - HTTP client for API communication
-   **shadcn/ui** - Pre-built accessible UI components
-   **Nginx** - Reverse proxy and static file server

### Backend

-   **FastAPI 0.104+** - Web framework
-   **Python 3.12+** - Programming language
-   **Uvicorn 0.24+** - ASGI server

### Database

-   **PostgreSQL 15+** - Relational database
-   **SQLAlchemy 2.0+** - ORM
-   **psycopg2-binary 2.9+** - PostgreSQL driver

### Data Validation

-   **Pydantic 2.5+** - Data validation and serialization
-   **pydantic-settings 2.1+** - Configuration management
-   **pytest 7.4+** - Testing framework
-   **pytest-cov 7.0+** - Code coverage

## Backend Architecture

```
┌─────────────────────────────────────────┐
│  Layer 1: API Layer                     │
│  - HTTP routing and request handling    │
│  - Calls Service Layer                  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Layer 2: Service Layer                 │
│  - Business logic and rules             │
│  - Orchestrates repositories            │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Layer 3: Repository Layer              │
│  - Data access and SQL queries          │
│  - CRUD operations                      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Layer 4: Database (PostgreSQL)         │
│  - Data storage and constraints         │
└─────────────────────────────────────────┘
```

## Supporting Components

-   **Models** (`app/models/`) - Database table definitions
-   **Schemas** (`app/schemas/`) - API request/response validation
-   **Dependencies** (`app/core/dependencies.py`) - Dependency injection setup

## CI/CD (GitHub Actions + Coolify)

This repository includes two workflows:

-   `.github/workflows/ci.yml`
    -   Runs on every push and pull request
    -   Backend: starts PostgreSQL service and runs `pytest`
    -   Frontend: runs lint and build
-   `.github/workflows/deploy-coolify.yml`
    -   Triggers only when `CI` succeeds for a push to `main`
    -   Calls your Coolify deploy webhook URL

### One-time setup

1. Ensure GitHub CLI is installed and authenticated:
    - `gh --version`
    - `gh auth status`
2. Ensure Coolify CLI is installed:
    - `coolify --help`
3. In Coolify, open your application and copy the Deploy Webhook URL.
4. From this repository root, run:
    - `./scripts/setup-cicd-secrets.sh`
5. Push to `main` (or run the `Deploy to Coolify` workflow manually from GitHub Actions).

### Workflow behavior

- `CI` runs on push, pull request, and manual dispatch.
- `Deploy to Coolify` runs automatically after successful `CI` on `main` pushes.
- `Deploy to Coolify` also supports manual dispatch.

### Suggested branch strategy

1. Use pull requests for all changes.
2. Require `CI` workflow to pass before merge.
3. Merge into `main` to auto-deploy to Coolify.

### Notes for Hetzner + Coolify

-   Keep production environment variables in Coolify (not in the repo).
-   Ensure your Coolify app is set to build from `main` branch.
-   If you want staging and production, duplicate the app in Coolify and use separate branches (for example, `develop` and `main`) with separate deploy webhooks.
