# Technologies & Architecture

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
