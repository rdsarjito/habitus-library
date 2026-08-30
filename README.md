# Library Management System

> **Live Demo:** [habitus.ramadhaninursarjito.tech](https://habitus.ramadhaninursarjito.tech) — Login: `admin` / `admin123`
> 
> **API Health:** [habitus-api.ramadhaninursarjito.tech/api/health](https://habitus-api.ramadhaninursarjito.tech/api/health)
> 
> **API Documentation (Swagger UI):** [habitus-api.ramadhaninursarjito.tech/api/docs](https://habitus-api.ramadhaninursarjito.tech/api/docs)
> 
> **API Documentation (Markdown):** [docs/API.md](./docs/API.md)
> 
> **Postman Collection:** [docs/postman_collection.json](./docs/postman_collection.json) — Import ke Postman, set variable `token` setelah login

A full-stack web application for managing library books, members, and loan transactions. Built as a take-home assessment project demonstrating clean architecture, business logic implementation, and modern web development practices.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Business Rules](#business-rules)
- [Assumptions](#assumptions)
- [Design Decisions](#design-decisions)
- [Running with Docker](#running-with-docker)
- [Production Deployment](#production-deployment)
- [Known Limitations](#known-limitations)
- [AI Assistance Disclosure](#ai-assistance-disclosure)

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/) | Runtime and type safety |
| [Express.js 5](https://expressjs.com/) | HTTP framework |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Prisma 6](https://www.prisma.io/) | ORM with type-safe queries and migrations |
| [Zod](https://zod.dev/) | Runtime schema validation for inputs and environment |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | Authentication tokens |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |

### Frontend
| Technology | Purpose |
|-----------|---------|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Pre-built accessible UI components |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight auth state management |
| [Axios](https://axios-http.com/) | HTTP client with interceptors |
| [TanStack React Query](https://tanstack.com/query) | Server state and caching |
| [Lucide React](https://lucide.dev/) | Icon library |

### Stack Rationale

- **Express.js** over NestJS/Fastify: simpler setup, widely understood, sufficient for this scope.
- **Prisma** over raw SQL/Knex: type-safe queries, auto-generated types, migration management.
- **Zustand** over Redux/Context: minimal boilerplate for auth-only state management.
- **shadcn/ui** over Material UI/Ant Design: composable components with full control over styling.
- **Zod** for both frontend and backend validation: single schema definition, runtime type safety.


## Architecture Overview

### Application Architecture

```
+------------------+         HTTPS          +------------------+
|                  | ----------------------> |                  |
|   Next.js 16     |    REST API (/api/v1)   |   Express.js 5   |
|   (Frontend)     | <---------------------- |   (Backend)      |
|   Port 3000      |     JSON Responses      |   Port 3001      |
|                  |                         |                  |
+------------------+                         +--------+---------+
                                                      |
                                                      | Prisma ORM
                                                      |
                                             +--------v---------+
                                             |                  |
                                             |  PostgreSQL 16   |
                                             |  (Database)      |
                                             |  Port 5432       |
                                             |                  |
                                             +------------------+
```

### Backend Layer Architecture

```
HTTP Request
     |
     v
+----+-------+
|   Routes   |  Route definitions, middleware chain
+----+-------+
     |
     v
+----+-------+
| Middleware |  Auth (JWT verify), Input Validation (Zod)
+----+-------+
     |
     v
+----+-------+
| Controller |  Parse request, call service, format response
+----+-------+
     |
     v
+----+-------+
|  Service   |  Business logic, validation rules, transactions
+----+-------+
     |
     v
+----+----------+
|  Repository  |  Prisma queries, database operations
+----+----------+
     |
     v
+----+----------+
|  PostgreSQL  |  Data persistence
+--------------+
```

### Request Flow Example — Borrow a Book

```
POST /api/v1/loans
     |
     +--> Auth Middleware       (verify JWT token)
     |
     +--> Validation Middleware (Zod schema check: memberId, bookId required)
     |
     +--> LoanController.create()
     |
     +--> LoanService.createLoan()
     |      |
     |      +--> Check: member exists & ACTIVE        -> MEMBER_INACTIVE
     |      +--> Check: active loans < MAX (3)        -> MEMBER_MAX_LOANS_REACHED
     |      +--> Check: no overdue loans              -> MEMBER_HAS_OVERDUE
     |      +--> Check: book in stock                 -> BOOK_OUT_OF_STOCK
     |      +--> Check: no duplicate active loan      -> DUPLICATE_ACTIVE_LOAN
     |      |
     |      +--> (all checks pass)
     |      |
     |      +--> BEGIN TRANSACTION
     |             SELECT book FOR UPDATE (pessimistic lock)
     |             INSERT loan record
     |             UPDATE book.availableCopies - 1
     |           COMMIT
     |
     +--> 201 Created { success: true, data: { loan } }
```


## Database Design

The system uses **4 tables** to manage the full library operation lifecycle:

```mermaid
erDiagram
    users {
        uuid id PK
        varchar(50) username UK
        varchar(255) password
        varchar(255) name
        timestamp created_at
        timestamp updated_at
    }

    books {
        uuid id PK
        varchar(255) title
        varchar(255) author
        varchar(13) isbn UK
        varchar(255) publisher
        int year_published
        varchar(100) category
        int total_copies
        int available_copies
        timestamp created_at
        timestamp updated_at
    }

    members {
        uuid id PK
        varchar(50) member_number UK
        varchar(255) name
        varchar(255) email UK
        varchar(20) phone
        enum status "ACTIVE|INACTIVE"
        timestamp created_at
        timestamp updated_at
    }

    loans {
        uuid id PK
        uuid member_id FK
        uuid book_id FK
        date loan_date
        date due_date
        date return_date "nullable"
        enum status "BORROWED|RETURNED"
        int late_days
        decimal(10_2) fine_amount "nullable"
        timestamp created_at
        timestamp updated_at
    }

    members ||--o{ loans : "borrows"
    books ||--o{ loans : "borrowed via"
```

### Design Decisions

1. **`OVERDUE` is not stored as a status** — A loan is considered overdue when `status = BORROWED AND due_date < today`. This is computed at query time rather than stored, eliminating the need for scheduled background jobs and ensuring the status is always accurate.

2. **`available_copies` tracked separately from `total_copies`** — When a loan is created, `available_copies` is decremented; on return, it is incremented. Both operations use `SELECT FOR UPDATE` within a database transaction to prevent race conditions when multiple staff process loans concurrently.

3. **`ON DELETE RESTRICT` on loans foreign keys** — Books and members cannot be deleted if they have existing loan records. This preserves transaction history and prevents orphaned loan records.

4. **Indexes for common query patterns** — Three composite indexes are defined on the `loans` table: `(member_id, status)` for member loan lookups, `(book_id, status)` for book availability checks, and `(status, due_date)` for overdue detection queries.

5. **UUID primary keys** — All tables use UUID (`@default(uuid())`) instead of auto-increment integers to prevent ID enumeration attacks and allow future distributed system migrations.

---

## Features

### Backend
- **Books Management** — CRUD operations with search (title, author, ISBN), category filtering, and pagination
- **Members Management** — CRUD operations with unique validation (email, member number) and status management
- **Loan Transactions** — Book borrowing with 7 business rule validations and atomic stock management
- **Book Returns** — Late day calculation, automatic fine computation, and double-return prevention
- **Authentication** — JWT-based staff login with protected routes
- **Dashboard Statistics** — Aggregated library metrics (books, members, loans, fines)

### Frontend
- **Login Page** — JWT authentication with error handling
- **Dashboard** — Real-time statistics cards with data from backend API
- **Books Page** — Data table with search, category filter, pagination, and CRUD dialogs
- **Members Page** — Data table with search, status filter, pagination, and CRUD dialogs
- **Loans Page** — Loan history with status filter and borrow dialog
- **Returns Page** — Dedicated page for processing book returns with overdue highlighting

### Cross-Cutting
- Consistent API response envelope (`success`, `message`, `data`, `meta`, `errors`)
- Loading, empty, and error states on all pages
- Toast notifications for all user actions
- Delete confirmation dialogs
- Server-side input validation (Zod) with field-level error display
- Environment-based configuration with validation

## Project Structure

```
habitus-library/
├── backend/
│ ├── prisma/
│ │ ├── schema.prisma # Database schema (4 models, 2 enums)
│ │ ├── seed.ts # Seed data (16 books, 6 members, 8 loans)
│ │ └── migrations/ # Prisma migration files
│ └── src/
│ ├── config/ # Database client, environment validation
│ ├── controllers/ # HTTP request handlers (thin layer)
│ ├── errors/ # Custom error classes (AppError hierarchy)
│ ├── middlewares/ # Auth, validation, error handler
│ ├── repositories/ # Database queries (Prisma operations)
│ ├── routes/ # Express route definitions
│ ├── services/ # Business logic layer
│ ├── utils/ # Helpers (date, pagination, response)
│ ├── validators/ # Zod schemas for input validation
│ ├── app.ts # Express app setup
│ └── server.ts # Server entry point
├── frontend/
│ └── src/
│ ├── app/ # Next.js pages (App Router)
│ │ ├── login/ # Login page
│ │ └── dashboard/ # Protected pages
│ │ ├── books/ # Books CRUD
│ │ ├── members/ # Members CRUD
│ │ └── loans/ # Loan management
│ ├── components/
│ │ ├── layout/ # Sidebar, Header, AppLayout
│ │ ├── shared/ # Reusable components (DeleteDialog)
│ │ └── ui/ # shadcn/ui components
│ ├── lib/api/ # Axios client and API service functions
│ ├── providers/ # React Query provider
│ ├── stores/ # Zustand auth store
│ └── types/ # TypeScript type definitions
└── README.md
```

**Architecture pattern**: Controller → Service → Repository

- **Controllers** handle HTTP concerns only (parse request, call service, send response).
- **Services** contain all business logic and validation rules.
- **Repositories** encapsulate database queries and transactions.

## Getting Started

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | v18+ | Only needed for local setup |
| npm | v9+ | Comes with Node.js |
| PostgreSQL | v14+ | Only needed for local setup (not Docker) |
| Docker | latest | Required for Docker setup |
| Docker Compose | v2+ | Required for Docker setup |

---

### Option A: Docker (Recommended)

The easiest way to run the application. Docker will spin up PostgreSQL, the backend API, and the frontend automatically.

**Step 1: Clone the repository**

```bash
git clone https://github.com/rdsarjito/habitus-library.git
cd habitus-library
```

**Step 2: Configure environment variables**

```bash
cp .env.example .env
```

The default `.env` values are already configured to work with Docker out of the box:

```env
POSTGRES_USER=library_user
POSTGRES_PASSWORD=library_pass
POSTGRES_DB=library_db
JWT_SECRET=change-me-in-production-min10
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**Step 3: Start all containers**

```bash
docker compose up --build
```

This starts 3 containers:
- `db` — PostgreSQL database on port `5432`
- `backend` — Express API on port `3001`
- `frontend` — Next.js app on port `3000`

On first startup, the backend automatically runs migrations and seeds sample data (16 books, 6 members).

**Step 4: Access the application**

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/api/docs |
| Health Check | http://localhost:3001/api/health |

Login with: **admin** / **admin123**

---

### Option B: Local Development (Without Docker)

> **Prerequisites:** PostgreSQL must be installed and running locally.

**Step 1: Clone the repository**

```bash
git clone https://github.com/rdsarjito/habitus-library.git
cd habitus-library
```

**Step 2: Setup Backend**

```bash
cd backend
cp .env.example .env
```

Open `.env` and update `DATABASE_URL` to match your local PostgreSQL credentials:

```env
# Format: postgresql://<username>:<password>@localhost:5432/<dbname>
# Example (no password):
DATABASE_URL=postgresql://your_pg_user@localhost:5432/library_db

# Example (with password):
DATABASE_URL=postgresql://your_pg_user:your_pg_password@localhost:5432/library_db
```

> **Note:** The default `.env.example` uses placeholder values. You must update `DATABASE_URL` with your actual PostgreSQL username. On macOS with Homebrew, the username is typically your system username (e.g., `rama`).

```bash
npm install
```

**Step 3: Run database migrations and seed**

```bash
# Create tables
npx prisma migrate deploy

# Seed initial data (16 books, 6 members, admin user)
npx prisma db seed
```

**Step 4: Start the backend**

```bash
npm run dev
# Backend running at http://localhost:3001
# Swagger UI at http://localhost:3001/api/docs
```

**Step 5: Setup Frontend**

Open a new terminal:

```bash
cd frontend
cp .env.example .env.local
```

Open `.env.local` and ensure this is set:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

```bash
npm install
npm run dev
# Frontend running at http://localhost:3000
```

**Step 6: Login**

Open http://localhost:3000 and login with **admin** / **admin123**

---

### Useful Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Build and start all services |
| `docker compose up -d` | Start in background (detached) |
| `docker compose down` | Stop all services |
| `docker compose down -v` | Stop and remove database volume (reset data) |
| `docker compose logs -f backend` | Follow backend logs |
| `docker compose logs -f frontend` | Follow frontend logs |
| `docker compose ps` | Show running containers |

### Run Tests

```bash
# All unit tests (30 tests)
cd backend && npm test

# With coverage report
cd backend && npm run test:coverage
```

### Troubleshooting

**Backend fails to connect to database:**
The backend waits for PostgreSQL to be healthy before starting. If it still fails, try:
```bash
docker compose down -v
docker compose up --build
```

**Database is empty after restart:**
Data is persisted in a Docker volume (`pgdata`). If you ran `docker compose down -v`, the volume was removed. Run `docker compose up` again to re-seed.

**Port conflict (3000 or 3001 already in use):**
Stop any local dev servers, or change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3002:3001"  # Map to different host port
```


## Production Deployment

The application is deployed on a self-hosted Linux server using Docker, accessible via Cloudflare Tunnel.

| Component | URL | Stack |
|-----------|-----|-------|
| **Frontend** | [habitus.ramadhaninursarjito.tech](https://habitus.ramadhaninursarjito.tech) | Next.js 16 (standalone) |
| **Backend API** | [habitus-api.ramadhaninursarjito.tech](https://habitus-api.ramadhaninursarjito.tech) | Express 5 + Prisma |
| **Database** | Internal only | PostgreSQL 16 |

### Architecture

```
Internet → Cloudflare (HTTPS) → Cloudflare Tunnel → Caddy (reverse proxy)
 ├─ habitus-frontend:3000
 └─ habitus-backend:3001
 └─ habitus-db:5432
```

### CI/CD

Every push to `main` triggers the full pipeline automatically:

```
git push → GitHub Actions CI → Pass? → Self-hosted Runner → Deploy
```

| Stage | Jobs |
|-------|------|
| **CI** | Lint, Type Check, Unit Tests (30 tests), Build |
| **CD** | `git pull` + `docker compose up --build` on server |

- **CI** runs on GitHub-hosted runners (Node 24)
- **CD** runs on a self-hosted runner on the laptop server (auto-starts after reboot)
- Deploy only triggers on `push` to `main` (not on pull requests)

### Deploy Manually

```bash
cd ~/habitus-dev
git pull origin main
docker compose -f docker-compose.prod.yml --env-file backend/.env up -d --build
```

## Known Limitations

The following items are not yet implemented:

- **Unit Tests**: Only loan service and date utility tests are implemented (30 tests). Integration tests and other service tests are not yet written
- **Search debounce**: Search uses a submit button rather than real-time debounce on keystroke
- **Soft delete**: Books and members use hard delete (with foreign key protection) rather than soft delete

## AI Assistance Disclosure

This project was developed with assistance from **Google Antigravity (Gemini-based AI coding assistant)**.

### What AI helped with
- **Project scaffolding** — Initial setup of Express, Next.js, Prisma, and Tailwind configurations
- **Boilerplate code** — CRUD controllers, repositories, route definitions, and UI components
- **Business logic implementation** — Loan validation rules, transaction handling, fine calculation
- **Frontend pages** — Dashboard statistics, data tables, form dialogs, and API client setup
- **TypeScript type definitions** — API response types and Zod schemas
- **README documentation** — Structure and content of this README

### What was verified manually
- All 17 API endpoints were tested with curl requests
- All business rules were verified with specific test scenarios (max loans, overdue, inactive member, out of stock, duplicate loan, double return)
- Database transactions and stock consistency were validated
- Frontend login flow, CRUD operations, and error handling were tested in the browser
- TypeScript compilation (`tsc --noEmit`) passes with 0 errors on both backend and frontend

### Tools used
- **Google Antigravity IDE** — AI-assisted coding with Gemini model
- **Prisma documentation** — Schema design and migration reference
- **shadcn/ui documentation** — Component installation and usage
- **Express.js 5 documentation** — Router and middleware API changes from v4

### How references were found
- Official documentation for each library (Express, Prisma, Next.js, shadcn/ui)
- Prisma migration and seeding guides for database setup
- TypeScript handbook for type safety patterns
- Express 5 migration guide for breaking changes from Express 4
