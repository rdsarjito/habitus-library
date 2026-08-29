# 📚 Sistem Manajemen Perpustakaan

Aplikasi full-stack untuk mengelola koleksi buku, anggota, dan peminjaman perpustakaan. Dibangun dengan **Next.js**, **Express.js**, **PostgreSQL**, dan **Prisma ORM**.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js 5
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Data Fetching**: TanStack React Query

## 📁 Project Structure

```
habitus-library/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed data
│   └── src/
│       ├── config/             # Environment & database config
│       ├── controllers/        # Route handlers
│       ├── errors/             # Custom error classes
│       ├── middlewares/        # Auth, validation, error handler
│       ├── repositories/       # Database queries
│       ├── routes/             # Express routes
│       ├── services/           # Business logic
│       ├── utils/              # Helpers (date, pagination, response)
│       └── validators/         # Zod schemas
├── frontend/
│   └── src/
│       ├── app/                # Next.js pages
│       │   ├── dashboard/      # Protected pages (books, members, loans)
│       │   └── login/          # Login page
│       ├── components/         # UI components (shadcn + custom)
│       ├── lib/api/            # Axios API client
│       ├── providers/          # React Query provider
│       ├── stores/             # Zustand auth store
│       └── types/              # TypeScript types
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm

### 1. Clone Repository
```bash
git clone https://github.com/rdsarjito/habitus-library.git
cd habitus-library
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env    # Edit sesuai konfigurasi database Anda
npm install
npx prisma migrate dev  # Jalankan migration
npm run db:seed          # Isi data awal
npm run dev              # Server di http://localhost:3001
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev              # Buka http://localhost:3000
```

### 4. Login
- **Username**: `admin`
- **Password**: `admin123`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/profile` | Get profile |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/books` | List books (search, filter, pagination) |
| GET | `/api/v1/books/:id` | Get book detail |
| POST | `/api/v1/books` | Create book |
| PUT | `/api/v1/books/:id` | Update book |
| DELETE | `/api/v1/books/:id` | Delete book |
| GET | `/api/v1/books/categories` | List categories |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/members` | List members (search, filter, pagination) |
| GET | `/api/v1/members/:id` | Get member detail |
| POST | `/api/v1/members` | Create member |
| PUT | `/api/v1/members/:id` | Update member |
| DELETE | `/api/v1/members/:id` | Delete member |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/loans` | List loans (filter by status) |
| GET | `/api/v1/loans/:id` | Get loan detail |
| POST | `/api/v1/loans` | Create loan |
| PATCH | `/api/v1/loans/:id/return` | Return loan |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard` | Get statistics |

## 🏗️ Business Rules

### Peminjaman
- Maksimal **3 buku aktif** per anggota
- Anggota **nonaktif** tidak dapat meminjam
- Anggota dengan **buku terlambat** tidak dapat meminjam baru
- Buku dengan **stok 0** tidak dapat dipinjam
- Anggota tidak dapat meminjam **buku yang sama** dua kali

### Pengembalian
- **Durasi pinjam**: 14 hari
- **Denda keterlambatan**: Rp 1.000/hari
- Status **OVERDUE** dihitung secara computed (bukan disimpan di database)

### Integritas Data
- Buku/anggota yang **memiliki riwayat transaksi** tidak dapat dihapus
- Stok buku otomatis berkurang saat dipinjam dan bertambah saat dikembalikan
- Race condition dicegah dengan **SELECT FOR UPDATE** (pessimistic locking)

## 🔐 Environment Variables

### Backend (`.env`)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/library_db
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
MAX_ACTIVE_LOANS=3
LOAN_DURATION_DAYS=14
FINE_PER_DAY=1000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 📊 Database Schema

```
User          Book           Member         Loan
─────         ─────          ──────         ─────
id (UUID)     id (UUID)      id (UUID)      id (UUID)
username      title          memberNumber   memberId → Member
password      author         name           bookId → Book
name          isbn           email          loanDate
              publisher      phone          dueDate
              yearPublished  status         returnDate
              category       (ACTIVE/       status
              totalCopies    INACTIVE)      (BORROWED/RETURNED)
              availableCopies               lateDays
                                            fineAmount
```

## 🧪 Seed Data
Database seed menyediakan:
- **1 admin user** (admin/admin123)
- **16 buku** (Programming, Fiction, Science, History)
- **6 anggota** (5 aktif, 1 nonaktif)
- **8 transaksi** (berbagai skenario: aktif, overdue, returned)
