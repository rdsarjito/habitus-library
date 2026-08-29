# 📚 Library Management System

A full-stack web application for managing library books, members, and loan transactions. Built as a take-home assessment project demonstrating clean architecture, business logic implementation, and modern web development practices.

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
- **Loans Page** — Loan creation, return with fine display, status filtering

### Cross-Cutting
- Consistent API response envelope (`success`, `message`, `data`, `meta`, `errors`)
- Loading, empty, and error states on all pages
- Toast notifications for all user actions
- Delete confirmation dialogs
- Server-side input validation (Zod) with field-level error display
- Environment-based configuration with validation

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + TypeScript** | Runtime and type safety |
| **Express.js 5** | HTTP framework |
| **PostgreSQL** | Relational database |
| **Prisma 6** | ORM with type-safe queries and migrations |
| **Zod** | Runtime schema validation for inputs and environment |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework (App Router) |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | Pre-built accessible UI components |
| **Zustand** | Lightweight auth state management |
| **Axios** | HTTP client with interceptors |
| **TanStack React Query** | Server state and caching |
| **Lucide React** | Icon library |

### Stack Rationale

- **Express.js** over NestJS/Fastify: simpler setup, widely understood, sufficient for this scope.
- **Prisma** over raw SQL/Knex: type-safe queries, auto-generated types, migration management.
- **Zustand** over Redux/Context: minimal boilerplate for auth-only state management.
- **shadcn/ui** over Material UI/Ant Design: composable components with full control over styling.
- **Zod** for both frontend and backend validation: single schema definition, runtime type safety.

## Project Structure

```
habitus-library/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (4 models, 2 enums)
│   │   ├── seed.ts                # Seed data (16 books, 6 members, 8 loans)
│   │   └── migrations/            # Prisma migration files
│   └── src/
│       ├── config/                # Database client, environment validation
│       ├── controllers/           # HTTP request handlers (thin layer)
│       ├── errors/                # Custom error classes (AppError hierarchy)
│       ├── middlewares/           # Auth, validation, error handler
│       ├── repositories/         # Database queries (Prisma operations)
│       ├── routes/                # Express route definitions
│       ├── services/              # Business logic layer
│       ├── utils/                 # Helpers (date, pagination, response)
│       ├── validators/            # Zod schemas for input validation
│       ├── app.ts                 # Express app setup
│       └── server.ts              # Server entry point
├── frontend/
│   └── src/
│       ├── app/                   # Next.js pages (App Router)
│       │   ├── login/             # Login page
│       │   └── dashboard/         # Protected pages
│       │       ├── books/         # Books CRUD
│       │       ├── members/       # Members CRUD
│       │       └── loans/         # Loan management
│       ├── components/
│       │   ├── layout/            # Sidebar, Header, AppLayout
│       │   ├── shared/            # Reusable components (DeleteDialog)
│       │   └── ui/                # shadcn/ui components
│       ├── lib/api/               # Axios client and API service functions
│       ├── providers/             # React Query provider
│       ├── stores/                # Zustand auth store
│       └── types/                 # TypeScript type definitions
└── README.md
```

**Architecture pattern**: Controller → Service → Repository

- **Controllers** handle HTTP concerns only (parse request, call service, send response).
- **Services** contain all business logic and validation rules.
- **Repositories** encapsulate database queries and transactions.

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** (comes with Node.js)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rdsarjito/habitus-library.git
cd habitus-library
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://youruser:yourpassword@localhost:5432/library_db
JWT_SECRET=your-secret-key-min-10-chars
```

Install dependencies:

```bash
npm install
```

### 3. Database Setup

Create the PostgreSQL database:

```bash
createdb library_db
```

Run migrations:

```bash
npx prisma migrate dev
```

Seed the database with sample data:

```bash
npm run db:seed
```

The seeder creates:
- **1 admin user** — username: `admin`, password: `admin123`
- **16 books** across 6 categories (Programming, Fiction, Science, History, Business, Self-Help)
- **6 members** — 5 active, 1 inactive (for testing business rules)
- **8 loan transactions** — active, overdue, and returned (for testing various scenarios)

Edge cases included in seed data:
- 1 member with 3 active loans (at maximum limit)
- 1 member with an overdue book
- 1 inactive member
- 1 book with 0 available copies

### 4. Start Backend Server

```bash
npm run dev
```

The server starts at `http://localhost:3001`. Verify with:

```bash
curl http://localhost:3001/api/health
```

API documentation (Swagger UI) is available at `http://localhost:3001/api/docs`.

### 5. Setup Frontend

Open a new terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend starts at `http://localhost:3000`.

### 6. Login

Open `http://localhost:3000` in your browser. Use the demo credentials:

- **Username**: `admin`
- **Password**: `admin123`

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Secret key for JWT signing (min 10 chars) |
| `JWT_EXPIRES_IN` | No | `24h` | JWT token expiration |
| `PORT` | No | `3001` | Server port |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |
| `NODE_ENV` | No | `development` | Environment mode |
| `MAX_ACTIVE_LOANS` | No | `3` | Maximum active loans per member |
| `LOAN_DURATION_DAYS` | No | `14` | Loan duration in days |
| `FINE_PER_DAY` | No | `1000` | Late fine per day (in Rupiah) |

All environment variables are validated at startup using Zod. The server will not start if required variables are missing or invalid.

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3001/api/v1` | Backend API base URL |

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database (drop all data + re-migrate + re-seed) |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |

## API Endpoints

All endpoints are prefixed with `/api/v1`. Protected endpoints require a JWT token in the `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | No | Login with username and password |
| `GET` | `/auth/profile` | Yes | Get current user profile |

### Books

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/books` | Yes | List books (search, filter, sort, paginate) |
| `GET` | `/books/categories` | Yes | List distinct book categories |
| `GET` | `/books/:id` | Yes | Get book by ID |
| `POST` | `/books` | Yes | Create a new book |
| `PUT` | `/books/:id` | Yes | Update a book |
| `DELETE` | `/books/:id` | Yes | Delete a book (restricted if has loans) |

**Query parameters for `GET /books`:**
- `search` — Search by title, author, or ISBN (case-insensitive)
- `category` — Filter by category
- `page`, `perPage` — Pagination (default: page=1, perPage=10)
- `sort`, `order` — Sorting (e.g., `sort=title&order=asc`)

### Members

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/members` | Yes | List members (search, filter, sort, paginate) |
| `GET` | `/members/:id` | Yes | Get member by ID |
| `POST` | `/members` | Yes | Create a new member |
| `PUT` | `/members/:id` | Yes | Update a member |
| `DELETE` | `/members/:id` | Yes | Delete a member (restricted if has loans) |

**Query parameters for `GET /members`:**
- `search` — Search by name, member number, or email
- `status` — Filter by `ACTIVE` or `INACTIVE`
- `page`, `perPage`, `sort`, `order` — Pagination and sorting

### Loans

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/loans` | Yes | List loans (filter by status, member) |
| `GET` | `/loans/:id` | Yes | Get loan by ID |
| `POST` | `/loans` | Yes | Create a new loan (borrow a book) |
| `PATCH` | `/loans/:id/return` | Yes | Return a borrowed book |

**Query parameters for `GET /loans`:**
- `status` — Filter by `BORROWED`, `OVERDUE`, or `RETURNED`
- `memberId` — Filter by member ID
- `page`, `perPage`, `sort`, `order` — Pagination and sorting

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/dashboard` | Yes | Get library statistics |

## Business Rules

### Loan Creation

When a loan is created, the system validates **all** of the following rules and returns **all violations at once** (not just the first one):

| Rule | Error Code | Description |
|------|-----------|-------------|
| Member must be active | `MEMBER_INACTIVE` | Inactive members cannot borrow books |
| Maximum 3 active loans | `MEMBER_MAX_LOANS_REACHED` | Configurable via `MAX_ACTIVE_LOANS` env var |
| No overdue books | `MEMBER_HAS_OVERDUE` | Members with overdue books must return them first |
| Book must be in stock | `BOOK_OUT_OF_STOCK` | Available copies must be > 0 |
| No duplicate active loan | `DUPLICATE_ACTIVE_LOAN` | Cannot borrow the same book twice |

Stock updates (`availableCopies`) are performed within a database transaction using `SELECT FOR UPDATE` to prevent race conditions.

### Book Return

- **On-time return**: `lateDays = 0`, no fine
- **Late return**: fine = `lateDays × FINE_PER_DAY` (default: Rp 1,000/day)
- **Double return**: rejected with `LOAN_ALREADY_RETURNED` error
- Stock is restored within the same database transaction

### Overdue Status

The `OVERDUE` status is **computed at query time**, not stored in the database. A loan is overdue when:
- `status = BORROWED` AND `dueDate < today`

This ensures status is always accurate without requiring scheduled jobs.

### Data Protection

- Books with existing loan records cannot be deleted (ON DELETE RESTRICT)
- Members with existing loan records cannot be deleted (ON DELETE RESTRICT)
- When updating `totalCopies`, the value cannot be less than currently borrowed copies

## Design Decisions

1. **Computed overdue status** — Instead of storing `OVERDUE` as a database enum, overdue is calculated at query time. This eliminates the need for scheduled jobs and ensures accuracy.

2. **Pessimistic locking for stock** — `SELECT FOR UPDATE` within transactions prevents two concurrent requests from borrowing the last copy of a book. This is more reliable than optimistic locking for this use case.

3. **All violations returned at once** — When a loan is rejected, all applicable reasons are returned in the `errors` array, not just the first violation found. This provides a better user experience.

4. **Express 5 `req.query` workaround** — Express 5 makes `req.query` read-only. Validated query parameters are passed via `res.locals.parsedQuery` from the validation middleware to controllers.

5. **Functional controllers** — Controllers use exported functions instead of classes to avoid `this` binding issues with Express route handlers and improve TypeScript compatibility.

6. **Environment validation at startup** — All environment variables are parsed and validated by Zod when the server starts. Missing or invalid values cause an immediate, descriptive error rather than failing at runtime.

7. **Configurable business rules** — Key values like max loans (3), loan duration (14 days), and fine per day (Rp 1,000) are configurable via environment variables, not hardcoded.

## Running with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) >= 20.10
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.0

### Quick Start

```bash
# Clone and enter the project
git clone https://github.com/rdsarjito/habitus-library.git
cd habitus-library

# Copy environment file
cp .env.example .env

# Build and start all services
docker compose up --build
```

This starts 3 services:
- **PostgreSQL** at `localhost:5432`
- **Backend API** at `http://localhost:3001`
- **Frontend** at `http://localhost:3000`

On first startup, the backend automatically runs database migrations and seeds sample data.

Login with: **admin** / **admin123**

### Useful Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Build and start all services |
| `docker compose up -d` | Start in background (detached) |
| `docker compose down` | Stop all services |
| `docker compose down -v` | Stop and remove database volume (reset data) |
| `docker compose logs -f backend` | Follow backend logs |
| `docker compose logs -f db` | Follow database logs |
| `docker compose ps` | Show running containers |

### Environment Configuration

Copy `.env.example` to `.env` and edit as needed:

```bash
cp .env.example .env
```

Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `library_user` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `library_pass` | PostgreSQL password |
| `POSTGRES_DB` | `library_db` | Database name |
| `JWT_SECRET` | `change-me-in-production-min10` | JWT signing secret |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | API URL for frontend |

> **Note:** For production, always change `POSTGRES_PASSWORD` and `JWT_SECRET` to strong, unique values.

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

## Known Limitations

The following items are not yet implemented:

- **Unit Tests**: Only loan service and date utility tests are implemented (30 tests). Integration tests and other service tests are not yet written
- **Deployment**: The application runs locally only; no production deployment
- **Mobile responsiveness**: The dashboard layout uses a fixed sidebar that is not optimized for mobile screen sizes
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
