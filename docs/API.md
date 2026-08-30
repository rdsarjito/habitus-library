# 📡 API Contract: Sistem Manajemen Perpustakaan

**Base URL:** `http://localhost:3001/api/v1`
**Content-Type:** `application/json`
**Authentication:** Bearer Token (JWT) pada header `Authorization`

---

## Standard Response Envelope

Seluruh endpoint menggunakan format response yang **konsisten**:

### Success Response

```jsonc
{
  "success": true,
  "message": "Deskripsi hasil operasi",
  "data": { ... }           // Object untuk single resource
  // atau
  "data": [ ... ],          // Array untuk list
  "meta": {                 // Hanya ada pada list endpoint
    "page": 1,
    "perPage": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Error Response

```jsonc
{
  "success": false,
  "message": "Deskripsi error utama",
  "errors": [               // Array of specific errors
    {
      "code": "ERROR_CODE",        // Machine-readable error code
      "field": "fieldName",        // Opsional, hanya untuk validation errors
      "message": "Pesan spesifik"  // Human-readable message
    }
  ]
}
```

---

## Pagination Convention

Semua list endpoint mendukung pagination via query params:

| Param | Type | Default | Keterangan |
|-------|------|---------|------------|
| `page` | integer | `1` | Halaman ke-n (1-indexed) |
| `perPage` | integer | `10` | Jumlah item per halaman (max: 100) |

---

## Sorting Convention

List endpoint yang mendukung sorting:

| Param | Type | Default | Keterangan |
|-------|------|---------|------------|
| `sort` | string | varies | Kolom yang di-sort |
| `order` | string | `asc` | `asc` atau `desc` |

---

# 🔐 A. Authentication

## A1. Login

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/auth/login` |
| **Purpose** | Autentikasi petugas dan mendapatkan JWT token |
| **Auth Required** | ❌ No |

### Request Body

```json
{
  "username": "admin",
  "password": "password123"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `username` | Required, string, min 3, max 50 |
| `password` | Required, string, min 6 |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "username": "admin",
      "name": "Admin Perpustakaan"
    }
  }
}
```

### Error Responses

| Status | Code | Kondisi | Contoh Response |
|--------|------|---------|-----------------|
| `422` | `VALIDATION_ERROR` | Input tidak valid | `{ "success": false, "message": "Validasi gagal", "errors": [{ "field": "username", "message": "Username wajib diisi" }] }` |
| `401` | `INVALID_CREDENTIALS` | Username/password salah | `{ "success": false, "message": "Username atau password salah", "errors": [{ "code": "INVALID_CREDENTIALS", "message": "Username atau password salah" }] }` |

---

## A2. Get Current User

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/auth/me` |
| **Purpose** | Mendapatkan profil user yang sedang login |
| **Auth Required** | ✅ Yes |

### Request Params — None
### Query Params — None
### Request Body — None

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Data user berhasil diambil",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "username": "admin",
    "name": "Admin Perpustakaan",
    "createdAt": "2026-08-01T10:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Kondisi |
|--------|------|---------|
| `401` | `UNAUTHORIZED` | Token tidak ada, expired, atau invalid |

---

# 📚 B. Books

## B1. List Books

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/books` |
| **Purpose** | Mengambil daftar buku dengan pencarian, filter, pagination, dan sorting |
| **Auth Required** | ✅ Yes |

### Request Params — None

### Query Params

| Param | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `search` | string | No | — | Cari di judul, penulis, atau ISBN (case-insensitive, partial match) |
| `category` | string | No | — | Filter berdasarkan kategori (exact match, case-insensitive) |
| `page` | integer | No | `1` | Halaman |
| `perPage` | integer | No | `10` | Item per halaman (1–100) |
| `sort` | string | No | `createdAt` | Kolom sort: `title`, `author`, `yearPublished`, `availableCopies`, `createdAt` |
| `order` | string | No | `desc` | `asc` atau `desc` |

### Request Body — None

### Validation Rules

| Param | Rules |
|-------|-------|
| `page` | Optional, integer, min 1 |
| `perPage` | Optional, integer, min 1, max 100 |
| `sort` | Optional, must be one of allowed values |
| `order` | Optional, must be `asc` or `desc` |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Data buku berhasil diambil",
  "data": [
    {
      "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884",
      "publisher": "Prentice Hall",
      "yearPublished": 2008,
      "category": "Programming",
      "totalCopies": 5,
      "availableCopies": 3,
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-15T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### Error Responses

| Status | Code | Kondisi |
|--------|------|---------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi |
| `422` | `VALIDATION_ERROR` | Query param tidak valid (misal `page=-1`) |

---

## B2. Get Book Detail

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/books/:id` |
| **Purpose** | Mengambil detail satu buku berdasarkan ID |
| **Auth Required** | ✅ Yes |

### Request Params

| Param | Type | Required | Keterangan |
|-------|------|----------|------------|
| `id` | UUID | Yes | ID buku |

### Query Params — None
### Request Body — None

### Validation Rules

| Param | Rules |
|-------|-------|
| `id` | Required, valid UUID format |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Detail buku berhasil diambil",
  "data": {
    "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "publisher": "Prentice Hall",
    "yearPublished": 2008,
    "category": "Programming",
    "totalCopies": 5,
    "availableCopies": 3,
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-15T14:30:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Kondisi | Contoh Response |
|--------|------|---------|-----------------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi | — |
| `404` | `NOT_FOUND` | Buku tidak ditemukan | `{ "success": false, "message": "Buku tidak ditemukan", "errors": [{ "code": "NOT_FOUND", "message": "Buku dengan ID b1a2c3d4... tidak ditemukan" }] }` |
| `422` | `VALIDATION_ERROR` | ID bukan format UUID | — |

---

## B3. Create Book

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/books` |
| **Purpose** | Menambahkan buku baru ke perpustakaan |
| **Auth Required** | ✅ Yes |

### Request Params — None
### Query Params — None

### Request Body

```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "publisher": "Prentice Hall",
  "yearPublished": 2008,
  "category": "Programming",
  "totalCopies": 5
}
```

> **Note:** `availableCopies` **tidak dikirim oleh client**. Saat create, otomatis di-set sama dengan `totalCopies`.

### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, string, min 1, max 255, trim whitespace |
| `author` | Required, string, min 1, max 255, trim whitespace |
| `isbn` | Required, string, stripped to digits only, must be 10 or 13 digits, unique |
| `publisher` | Required, string, min 1, max 255, trim whitespace |
| `yearPublished` | Required, integer, min 1000, max current year (2026) |
| `category` | Required, string, min 1, max 100, trim whitespace |
| `totalCopies` | Required, integer, min 1 |

### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "publisher": "Prentice Hall",
    "yearPublished": 2008,
    "category": "Programming",
    "totalCopies": 5,
    "availableCopies": 5,
    "createdAt": "2026-08-29T10:00:00.000Z",
    "updatedAt": "2026-08-29T10:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Kondisi | Contoh Response |
|--------|------|---------|-----------------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi | — |
| `409` | `DUPLICATE_ENTRY` | ISBN sudah terdaftar | `{ "success": false, "message": "ISBN sudah terdaftar", "errors": [{ "code": "DUPLICATE_ENTRY", "field": "isbn", "message": "ISBN 9780132350884 sudah terdaftar dalam sistem" }] }` |
| `422` | `VALIDATION_ERROR` | Input tidak valid | `{ "success": false, "message": "Validasi gagal", "errors": [{ "code": "VALIDATION_ERROR", "field": "yearPublished", "message": "Tahun terbit tidak boleh lebih dari tahun sekarang" }, { "code": "VALIDATION_ERROR", "field": "totalCopies", "message": "Jumlah eksemplar minimal 1" }] }` |

---

## B4. Update Book

| Aspect | Detail |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/v1/books/:id` |
| **Purpose** | Mengupdate data buku |
| **Auth Required** | ✅ Yes |

### Request Params

| Param | Type | Required | Keterangan |
|-------|------|----------|------------|
| `id` | UUID | Yes | ID buku yang akan diupdate |

### Query Params — None

### Request Body

```json
{
  "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "publisher": "Prentice Hall",
  "yearPublished": 2008,
  "category": "Software Engineering",
  "totalCopies": 8
}
```

> **Note:** `availableCopies` **tidak dikirim oleh client**. Saat `totalCopies` berubah, `availableCopies` dihitung ulang: `availableCopies_baru = totalCopies_baru - jumlah_sedang_dipinjam`.

### Validation Rules

| Field | Rules |
|-------|-------|
| `title` | Required, string, min 1, max 255 |
| `author` | Required, string, min 1, max 255 |
| `isbn` | Required, string, digits only 10 or 13, unique (exclude self) |
| `publisher` | Required, string, min 1, max 255 |
| `yearPublished` | Required, integer, min 1000, max current year |
| `category` | Required, string, min 1, max 100 |
| `totalCopies` | Required, integer, min 1, **must be >= currently borrowed count** |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Buku berhasil diperbarui",
  "data": {
    "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "publisher": "Prentice Hall",
    "yearPublished": 2008,
    "category": "Software Engineering",
    "totalCopies": 8,
    "availableCopies": 6,
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-29T11:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Kondisi | Contoh Response |
|--------|------|---------|-----------------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi | — |
| `404` | `NOT_FOUND` | Buku tidak ditemukan | — |
| `409` | `DUPLICATE_ENTRY` | ISBN sudah dipakai buku lain | `{ "success": false, "message": "ISBN sudah terdaftar", "errors": [{ "code": "DUPLICATE_ENTRY", "field": "isbn", "message": "ISBN 9780132350884 sudah digunakan oleh buku lain" }] }` |
| `400` | `INVALID_TOTAL_COPIES` | totalCopies < jumlah sedang dipinjam | `{ "success": false, "message": "Total eksemplar tidak valid", "errors": [{ "code": "INVALID_TOTAL_COPIES", "message": "Total eksemplar tidak boleh kurang dari 2 (jumlah yang sedang dipinjam)" }] }` |
| `422` | `VALIDATION_ERROR` | Input tidak valid | — |

---

## B5. Delete Book

| Aspect | Detail |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/books/:id` |
| **Purpose** | Menghapus buku dari perpustakaan |
| **Auth Required** | ✅ Yes |

### Request Params

| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | Yes |

### Query Params — None
### Request Body — None

### Validation Rules

| Param | Rules |
|-------|-------|
| `id` | Required, valid UUID format |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Buku berhasil dihapus",
  "data": {
    "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Clean Code"
  }
}
```

### Error Responses

| Status | Code | Kondisi | Contoh Response |
|--------|------|---------|-----------------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi | — |
| `404` | `NOT_FOUND` | Buku tidak ditemukan | — |
| `400` | `BOOK_HAS_ACTIVE_LOANS` | Buku masih ada yang meminjam | `{ "success": false, "message": "Buku tidak dapat dihapus", "errors": [{ "code": "BOOK_HAS_ACTIVE_LOANS", "message": "Buku \"Clean Code\" masih dipinjam oleh 2 anggota" }] }` |

---

# 👤 C. Members

## C1. List Members

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/members` |
| **Purpose** | Mengambil daftar anggota perpustakaan |
| **Auth Required** | ✅ Yes |

### Request Params — None

### Query Params

| Param | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `search` | string | No | — | Cari di nama, nomor anggota, atau email (case-insensitive, partial match) |
| `status` | string | No | — | Filter berdasarkan status: `ACTIVE` atau `INACTIVE` |
| `page` | integer | No | `1` | Halaman |
| `perPage` | integer | No | `10` | Item per halaman (1–100) |
| `sort` | string | No | `createdAt` | Kolom sort: `name`, `memberNumber`, `email`, `status`, `createdAt` |
| `order` | string | No | `desc` | `asc` atau `desc` |

### Request Body — None

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Data anggota berhasil diambil",
  "data": [
    {
      "id": "m1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "memberNumber": "MBR-2026-001",
      "name": "Budi Santoso",
      "email": "budi@email.com",
      "phone": "081234567890",
      "status": "ACTIVE",
      "createdAt": "2026-08-01T10:00:00.000Z",
      "updatedAt": "2026-08-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### Error Responses

| Status | Code | Kondisi |
|--------|------|---------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi |
| `422` | `VALIDATION_ERROR` | Query param tidak valid |

---

## C2. Get Member Detail

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/members/:id` |
| **Purpose** | Mengambil detail satu anggota beserta ringkasan peminjaman |
| **Auth Required** | ✅ Yes |

### Request Params

| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | Yes |

### Query Params — None
### Request Body — None

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Detail anggota berhasil diambil",
  "data": {
    "id": "m1a2c3d4-e5f6-7890-abcd-ef1234567890",
    "memberNumber": "MBR-2026-001",
    "name": "Budi Santoso",
    "email": "budi@email.com",
    "phone": "081234567890",
    "status": "ACTIVE",
    "activeLoansCount": 2,
    "overdueLoansCount": 0,
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-01T10:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Kondisi |
|--------|------|---------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi |
| `404` | `NOT_FOUND` | Anggota tidak ditemukan |

---

## C3. Create Member

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/members` |
| **Purpose** | Menambahkan anggota baru |
| **Auth Required** | ✅ Yes |

### Request Params — None
### Query Params — None

### Request Body

```json
{
  "memberNumber": "MBR-2026-006",
  "name": "Siti Aminah",
  "email": "siti@email.com",
  "phone": "081298765432",
  "status": "ACTIVE"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `memberNumber` | Required, string, min 1, max 50, unique, trim whitespace |
| `name` | Required, string, min 1, max 255, trim whitespace |
| `email` | Required, string, valid email format, max 255, unique, normalized to lowercase |
| `phone` | Required, string, min 1, max 20, trim whitespace |
| `status` | Optional, must be `ACTIVE` or `INACTIVE`, default `ACTIVE` |

### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "Anggota berhasil ditambahkan",
  "data": {
    "id": "m2b3c4d5-e6f7-8901-abcd-ef2345678901",
    "memberNumber": "MBR-2026-006",
    "name": "Siti Aminah",
    "email": "siti@email.com",
    "phone": "081298765432",
    "status": "ACTIVE",
    "createdAt": "2026-08-29T10:00:00.000Z",
    "updatedAt": "2026-08-29T10:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Kondisi | Contoh Response |
|--------|------|---------|-----------------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi | — |
| `409` | `DUPLICATE_ENTRY` | Nomor anggota sudah terdaftar | `{ "success": false, "message": "Data duplikat", "errors": [{ "code": "DUPLICATE_ENTRY", "field": "memberNumber", "message": "Nomor anggota MBR-2026-006 sudah terdaftar" }] }` |
| `409` | `DUPLICATE_ENTRY` | Email sudah terdaftar | `{ "success": false, "message": "Data duplikat", "errors": [{ "code": "DUPLICATE_ENTRY", "field": "email", "message": "Email siti@email.com sudah terdaftar" }] }` |
| `409` | `DUPLICATE_ENTRY` | Keduanya duplikat (return semua) | `{ "success": false, "message": "Data duplikat", "errors": [{ "code": "DUPLICATE_ENTRY", "field": "memberNumber", "message": "Nomor anggota MBR-2026-006 sudah terdaftar" }, { "code": "DUPLICATE_ENTRY", "field": "email", "message": "Email siti@email.com sudah terdaftar" }] }` |
| `422` | `VALIDATION_ERROR` | Input tidak valid | — |

---

## C4. Update Member

| Aspect | Detail |
|--------|--------|
| **Method** | `PUT` |
| **URL** | `/api/v1/members/:id` |
| **Purpose** | Mengupdate data anggota |
| **Auth Required** | ✅ Yes |

### Request Params

| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | Yes |

### Query Params — None

### Request Body

```json
{
  "memberNumber": "MBR-2026-006",
  "name": "Siti Aminah Putri",
  "email": "siti.putri@email.com",
  "phone": "081298765432",
  "status": "INACTIVE"
}
```

### Validation Rules

| Field | Rules |
|-------|-------|
| `memberNumber` | Required, string, min 1, max 50, unique (exclude self) |
| `name` | Required, string, min 1, max 255 |
| `email` | Required, string, valid email, max 255, unique (exclude self), lowercase |
| `phone` | Required, string, min 1, max 20 |
| `status` | Required, must be `ACTIVE` or `INACTIVE` |

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Anggota berhasil diperbarui",
  "data": {
    "id": "m2b3c4d5-e6f7-8901-abcd-ef2345678901",
    "memberNumber": "MBR-2026-006",
    "name": "Siti Aminah Putri",
    "email": "siti.putri@email.com",
    "phone": "081298765432",
    "status": "INACTIVE",
    "createdAt": "2026-08-29T10:00:00.000Z",
    "updatedAt": "2026-08-29T11:30:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Kondisi |
|--------|------|---------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi |
| `404` | `NOT_FOUND` | Anggota tidak ditemukan |
| `409` | `DUPLICATE_ENTRY` | Nomor anggota atau email sudah dipakai anggota lain |
| `422` | `VALIDATION_ERROR` | Input tidak valid |

---

## C5. Delete Member

| Aspect | Detail |
|--------|--------|
| **Method** | `DELETE` |
| **URL** | `/api/v1/members/:id` |
| **Purpose** | Menghapus data anggota |
| **Auth Required** | ✅ Yes |

### Request Params

| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | Yes |

### Query Params — None
### Request Body — None

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Anggota berhasil dihapus",
  "data": {
    "id": "m2b3c4d5-e6f7-8901-abcd-ef2345678901",
    "name": "Siti Aminah Putri"
  }
}
```

### Error Responses

| Status | Code | Kondisi | Contoh Response |
|--------|------|---------|-----------------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi | — |
| `404` | `NOT_FOUND` | Anggota tidak ditemukan | — |
| `400` | `MEMBER_HAS_ACTIVE_LOANS` | Anggota masih punya peminjaman aktif | `{ "success": false, "message": "Anggota tidak dapat dihapus", "errors": [{ "code": "MEMBER_HAS_ACTIVE_LOANS", "message": "Anggota \"Budi Santoso\" masih memiliki 2 buku yang belum dikembalikan" }] }` |

---

# 📖 D. Loans (Inti Penilaian)

## D1. List Loans (Riwayat Transaksi)

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/loans` |
| **Purpose** | Mengambil riwayat transaksi peminjaman dengan filter |
| **Auth Required** | ✅ Yes |

### Request Params — None

### Query Params

| Param | Type | Required | Default | Keterangan |
|-------|------|----------|---------|------------|
| `status` | string | No | — | Filter status: `BORROWED`, `RETURNED`, atau `OVERDUE` |
| `memberId` | UUID | No | — | Filter berdasarkan anggota |
| `bookId` | UUID | No | — | Filter berdasarkan buku |
| `page` | integer | No | `1` | Halaman |
| `perPage` | integer | No | `10` | Item per halaman (1–100) |
| `sort` | string | No | `createdAt` | Kolom sort: `loanDate`, `dueDate`, `returnDate`, `status`, `createdAt` |
| `order` | string | No | `desc` | `asc` atau `desc` |

> **Catatan penting tentang filter `status`:**
> - `BORROWED` → `WHERE status = 'BORROWED' AND due_date >= CURRENT_DATE`
> - `OVERDUE` → `WHERE status = 'BORROWED' AND due_date < CURRENT_DATE`
> - `RETURNED` → `WHERE status = 'RETURNED'`
> - Tanpa filter → Semua transaksi, dengan `displayStatus` computed

### Request Body — None

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Riwayat transaksi berhasil diambil",
  "data": [
    {
      "id": "l1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "member": {
        "id": "m1a2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Budi Santoso",
        "memberNumber": "MBR-2026-001"
      },
      "book": {
        "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Clean Code",
        "isbn": "9780132350884"
      },
      "loanDate": "2026-08-15",
      "dueDate": "2026-08-29",
      "returnDate": null,
      "status": "BORROWED",
      "displayStatus": "OVERDUE",
      "lateDays": 0,
      "fineAmount": null,
      "createdAt": "2026-08-15T10:00:00.000Z"
    },
    {
      "id": "l2b3c4d5-e6f7-8901-abcd-ef2345678901",
      "member": {
        "id": "m1a2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Budi Santoso",
        "memberNumber": "MBR-2026-001"
      },
      "book": {
        "id": "b2b3c4d5-e6f7-8901-abcd-ef2345678901",
        "title": "Design Patterns",
        "isbn": "9780201633610"
      },
      "loanDate": "2026-08-10",
      "dueDate": "2026-08-24",
      "returnDate": "2026-08-22",
      "status": "RETURNED",
      "displayStatus": "RETURNED",
      "lateDays": 0,
      "fineAmount": null,
      "createdAt": "2026-08-10T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

> **Perhatikan:** Field `displayStatus` adalah computed status. Untuk transaksi yang `status = 'BORROWED'` tapi sudah lewat `dueDate`, `displayStatus` akan bernilai `"OVERDUE"`. Field `status` tetap menampilkan status tersimpan di database.

### Error Responses

| Status | Code | Kondisi |
|--------|------|---------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi |
| `422` | `VALIDATION_ERROR` | Query param tidak valid |

---

## D2. Get Loan Detail

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/loans/:id` |
| **Purpose** | Mengambil detail satu transaksi peminjaman |
| **Auth Required** | ✅ Yes |

### Request Params

| Param | Type | Required |
|-------|------|----------|
| `id` | UUID | Yes |

### Query Params — None
### Request Body — None

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Detail transaksi berhasil diambil",
  "data": {
    "id": "l1a2c3d4-e5f6-7890-abcd-ef1234567890",
    "member": {
      "id": "m1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Budi Santoso",
      "memberNumber": "MBR-2026-001",
      "email": "budi@email.com"
    },
    "book": {
      "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "isbn": "9780132350884"
    },
    "loanDate": "2026-08-15",
    "dueDate": "2026-08-29",
    "returnDate": null,
    "status": "BORROWED",
    "displayStatus": "BORROWED",
    "lateDays": 0,
    "fineAmount": null,
    "createdAt": "2026-08-15T10:00:00.000Z",
    "updatedAt": "2026-08-15T10:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Kondisi |
|--------|------|---------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi |
| `404` | `NOT_FOUND` | Transaksi tidak ditemukan |

---

## D3. Create Loan (Peminjaman Buku) ⭐

> **Ini adalah endpoint INTI penilaian.**

| Aspect | Detail |
|--------|--------|
| **Method** | `POST` |
| **URL** | `/api/v1/loans` |
| **Purpose** | Mencatat peminjaman buku baru oleh anggota |
| **Auth Required** | ✅ Yes |

### Request Params — None
### Query Params — None

### Request Body

```json
{
  "memberId": "m1a2c3d4-e5f6-7890-abcd-ef1234567890",
  "bookId": "b1a2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

> **Note:** `loanDate` otomatis = hari ini. `dueDate` otomatis = hari ini + 14 hari. Petugas **tidak** input tanggal manual.

### Validation Rules

| Field | Rules |
|-------|-------|
| `memberId` | Required, valid UUID, must exist in members table |
| `bookId` | Required, valid UUID, must exist in books table |

### Business Rules (Semua dicek sebelum proses)

| # | Rule | Error Code |
|---|------|------------|
| 1 | Buku harus masih tersedia (`availableCopies > 0`) | `BOOK_OUT_OF_STOCK` |
| 2 | Anggota harus berstatus `ACTIVE` | `MEMBER_INACTIVE` |
| 3 | Anggota belum mencapai batas maks peminjaman aktif (3 buku) | `MEMBER_MAX_LOANS_REACHED` |
| 4 | Anggota tidak memiliki buku yang sudah lewat jatuh tempo | `MEMBER_HAS_OVERDUE` |
| 5 | Anggota tidak sedang meminjam buku yang sama | `DUPLICATE_ACTIVE_LOAN` |

> **PENTING:** Semua business rules dicek **sebelum** proses. Jika ada multiple violations, **SEMUA** ditampilkan dalam array `errors`, bukan hanya yang pertama.

### Success Response — `201 Created`

```json
{
  "success": true,
  "message": "Peminjaman berhasil dicatat",
  "data": {
    "id": "l3c4d5e6-f7a8-9012-bcde-f34567890123",
    "member": {
      "id": "m1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Budi Santoso",
      "memberNumber": "MBR-2026-001"
    },
    "book": {
      "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Clean Code",
      "isbn": "9780132350884",
      "availableCopies": 2
    },
    "loanDate": "2026-08-29",
    "dueDate": "2026-09-12",
    "returnDate": null,
    "status": "BORROWED",
    "displayStatus": "BORROWED",
    "lateDays": 0,
    "fineAmount": null,
    "createdAt": "2026-08-29T10:00:00.000Z"
  }
}
```

### Error Responses

#### Single Violation — `400 Bad Request`

**Stok habis:**
```json
{
  "success": false,
  "message": "Peminjaman tidak dapat diproses",
  "errors": [
    {
      "code": "BOOK_OUT_OF_STOCK",
      "message": "Buku \"Clean Code\" tidak tersedia (stok: 0)"
    }
  ]
}
```

**Anggota nonaktif:**
```json
{
  "success": false,
  "message": "Peminjaman tidak dapat diproses",
  "errors": [
    {
      "code": "MEMBER_INACTIVE",
      "message": "Anggota \"Budi Santoso\" berstatus nonaktif dan tidak dapat meminjam buku"
    }
  ]
}
```

**Batas maks peminjaman:**
```json
{
  "success": false,
  "message": "Peminjaman tidak dapat diproses",
  "errors": [
    {
      "code": "MEMBER_MAX_LOANS_REACHED",
      "message": "Anggota \"Budi Santoso\" sudah mencapai batas maksimum peminjaman aktif (3 buku)"
    }
  ]
}
```

**Ada buku overdue:**
```json
{
  "success": false,
  "message": "Peminjaman tidak dapat diproses",
  "errors": [
    {
      "code": "MEMBER_HAS_OVERDUE",
      "message": "Anggota \"Budi Santoso\" masih memiliki 1 buku yang melewati batas waktu pengembalian"
    }
  ]
}
```

**Sudah meminjam buku yang sama:**
```json
{
  "success": false,
  "message": "Peminjaman tidak dapat diproses",
  "errors": [
    {
      "code": "DUPLICATE_ACTIVE_LOAN",
      "message": "Anggota \"Budi Santoso\" sudah meminjam buku \"Clean Code\" dan belum mengembalikannya"
    }
  ]
}
```

#### Multiple Violations — `400 Bad Request`

```json
{
  "success": false,
  "message": "Peminjaman tidak dapat diproses",
  "errors": [
    {
      "code": "MEMBER_INACTIVE",
      "message": "Anggota \"Budi Santoso\" berstatus nonaktif dan tidak dapat meminjam buku"
    },
    {
      "code": "MEMBER_MAX_LOANS_REACHED",
      "message": "Anggota \"Budi Santoso\" sudah mencapai batas maksimum peminjaman aktif (3 buku)"
    },
    {
      "code": "MEMBER_HAS_OVERDUE",
      "message": "Anggota \"Budi Santoso\" masih memiliki 2 buku yang melewati batas waktu pengembalian"
    }
  ]
}
```

#### Other Errors

| Status | Code | Kondisi |
|--------|------|---------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi |
| `404` | `NOT_FOUND` | Member atau Book tidak ditemukan |
| `422` | `VALIDATION_ERROR` | Input tidak valid (bukan UUID, field kosong) |

---

## D4. Return Book (Pengembalian Buku) ⭐

> **Ini adalah endpoint INTI penilaian.**

| Aspect | Detail |
|--------|--------|
| **Method** | `PATCH` |
| **URL** | `/api/v1/loans/:id/return` |
| **Purpose** | Memproses pengembalian buku |
| **Auth Required** | ✅ Yes |

### Request Params

| Param | Type | Required | Keterangan |
|-------|------|----------|------------|
| `id` | UUID | Yes | ID transaksi peminjaman (loan) |

### Query Params — None
### Request Body — None

> **Tidak ada request body.** Loan ID sudah cukup. `returnDate` otomatis = hari ini. `lateDays` dan `fineAmount` dihitung otomatis oleh sistem.

### Business Rules

| # | Rule | Error Code |
|---|------|------------|
| 1 | Transaksi harus ada | `NOT_FOUND` |
| 2 | Transaksi belum pernah dikembalikan (`status != 'RETURNED'`) | `LOAN_ALREADY_RETURNED` |

### Perhitungan Otomatis

```
returnDate = CURRENT_DATE

Jika returnDate > dueDate:
  lateDays = returnDate - dueDate (dalam hari)
  fineAmount = lateDays × Rp 1.000
  
Jika returnDate <= dueDate:
  lateDays = 0
  fineAmount = null (tidak ada denda)
```

### Success Response — Tepat Waktu — `200 OK`

```json
{
  "success": true,
  "message": "Pengembalian berhasil dicatat",
  "data": {
    "id": "l3c4d5e6-f7a8-9012-bcde-f34567890123",
    "member": {
      "id": "m1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Budi Santoso",
      "memberNumber": "MBR-2026-001"
    },
    "book": {
      "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Clean Code",
      "isbn": "9780132350884",
      "availableCopies": 4
    },
    "loanDate": "2026-08-15",
    "dueDate": "2026-08-29",
    "returnDate": "2026-08-28",
    "status": "RETURNED",
    "displayStatus": "RETURNED",
    "lateDays": 0,
    "fineAmount": null,
    "createdAt": "2026-08-15T10:00:00.000Z",
    "updatedAt": "2026-08-28T14:00:00.000Z"
  }
}
```

### Success Response — Terlambat — `200 OK`

```json
{
  "success": true,
  "message": "Pengembalian berhasil dicatat. Buku terlambat dikembalikan selama 5 hari dengan denda Rp 5.000",
  "data": {
    "id": "l3c4d5e6-f7a8-9012-bcde-f34567890123",
    "member": {
      "id": "m1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Budi Santoso",
      "memberNumber": "MBR-2026-001"
    },
    "book": {
      "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Clean Code",
      "isbn": "9780132350884",
      "availableCopies": 4
    },
    "loanDate": "2026-08-10",
    "dueDate": "2026-08-24",
    "returnDate": "2026-08-29",
    "status": "RETURNED",
    "displayStatus": "RETURNED",
    "lateDays": 5,
    "fineAmount": "5000.00",
    "createdAt": "2026-08-10T10:00:00.000Z",
    "updatedAt": "2026-08-29T14:00:00.000Z"
  }
}
```

### Error Responses

| Status | Code | Kondisi | Contoh Response |
|--------|------|---------|-----------------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi | — |
| `404` | `NOT_FOUND` | Transaksi tidak ditemukan | `{ "success": false, "message": "Transaksi tidak ditemukan", "errors": [{ "code": "NOT_FOUND", "message": "Transaksi dengan ID l3c4d5e6... tidak ditemukan" }] }` |
| `409` | `LOAN_ALREADY_RETURNED` | Sudah dikembalikan sebelumnya | `{ "success": false, "message": "Buku sudah dikembalikan", "errors": [{ "code": "LOAN_ALREADY_RETURNED", "message": "Buku \"Clean Code\" sudah dikembalikan pada tanggal 28 Agustus 2026" }] }` |

---

# 📊 E. Dashboard (Bonus)

## E1. Get Dashboard Statistics

| Aspect | Detail |
|--------|--------|
| **Method** | `GET` |
| **URL** | `/api/v1/dashboard/stats` |
| **Purpose** | Mengambil statistik ringkasan perpustakaan |
| **Auth Required** | ✅ Yes |

### Request Params — None
### Query Params — None
### Request Body — None

### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Statistik berhasil diambil",
  "data": {
    "totalBooks": 15,
    "totalMembers": 5,
    "activeMembers": 4,
    "totalLoans": 23,
    "activeLoans": 8,
    "overdueLoans": 2,
    "booksAvailable": 12,
    "booksOutOfStock": 3,
    "totalFinesCollected": "25000.00",
    "recentLoans": [
      {
        "id": "l3c4d5e6-f7a8-9012-bcde-f34567890123",
        "memberName": "Budi Santoso",
        "bookTitle": "Clean Code",
        "loanDate": "2026-08-29",
        "dueDate": "2026-09-12",
        "displayStatus": "BORROWED"
      }
    ],
    "popularBooks": [
      {
        "id": "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "totalLoans": 8
      }
    ]
  }
}
```

### Error Responses

| Status | Code | Kondisi |
|--------|------|---------|
| `401` | `UNAUTHORIZED` | Tidak terautentikasi |

---

# 📋 Appendix

## Error Code Reference

| Code | HTTP Status | Deskripsi | Dipakai di Endpoint |
|------|-------------|-----------|---------------------|
| `VALIDATION_ERROR` | `422` | Input tidak memenuhi validation rules | Semua POST/PUT |
| `NOT_FOUND` | `404` | Resource tidak ditemukan | Semua /:id |
| `UNAUTHORIZED` | `401` | Token tidak ada, expired, atau invalid | Semua (kecuali login) |
| `INVALID_CREDENTIALS` | `401` | Username atau password salah | Login |
| `DUPLICATE_ENTRY` | `409` | Unique constraint violation | Create/Update Book, Member |
| `BOOK_OUT_OF_STOCK` | `400` | Stok buku habis | Create Loan |
| `MEMBER_INACTIVE` | `400` | Anggota berstatus nonaktif | Create Loan |
| `MEMBER_MAX_LOANS_REACHED` | `400` | Batas maks peminjaman tercapai | Create Loan |
| `MEMBER_HAS_OVERDUE` | `400` | Anggota punya buku terlambat | Create Loan |
| `DUPLICATE_ACTIVE_LOAN` | `400` | Anggota sudah pinjam buku yang sama | Create Loan |
| `LOAN_ALREADY_RETURNED` | `409` | Transaksi sudah dikembalikan | Return Book |
| `BOOK_HAS_ACTIVE_LOANS` | `400` | Buku tidak bisa dihapus, masih dipinjam | Delete Book |
| `MEMBER_HAS_ACTIVE_LOANS` | `400` | Anggota tidak bisa dihapus, masih punya pinjaman | Delete Member |
| `INVALID_TOTAL_COPIES` | `400` | Total eksemplar < jumlah yang sedang dipinjam | Update Book |
| `INTERNAL_ERROR` | `500` | Unexpected server error | Semua |

## HTTP Status Code Summary

| Status | Meaning | Dipakai Saat |
|--------|---------|-------------|
| `200` | OK | Berhasil: GET, PUT, PATCH, DELETE |
| `201` | Created | Berhasil: POST (create resource baru) |
| `400` | Bad Request | Business rule violation (loan rejection, delete protection) |
| `401` | Unauthorized | Token tidak ada atau invalid |
| `404` | Not Found | Resource dengan ID tersebut tidak ada |
| `409` | Conflict | Unique constraint violation, double return |
| `422` | Unprocessable Entity | Validation error (format, type, required) |
| `500` | Internal Server Error | Unexpected error (bug, DB down, dll) |

## Endpoint Summary Table

| # | Method | Endpoint | Purpose | Auth |
|---|--------|----------|---------|------|
| A1 | `POST` | `/api/v1/auth/login` | Login petugas | ❌ |
| A2 | `GET` | `/api/v1/auth/me` | Get current user | ✅ |
| B1 | `GET` | `/api/v1/books` | List buku | ✅ |
| B2 | `GET` | `/api/v1/books/:id` | Detail buku | ✅ |
| B3 | `POST` | `/api/v1/books` | Tambah buku | ✅ |
| B4 | `PUT` | `/api/v1/books/:id` | Update buku | ✅ |
| B5 | `DELETE` | `/api/v1/books/:id` | Hapus buku | ✅ |
| C1 | `GET` | `/api/v1/members` | List anggota | ✅ |
| C2 | `GET` | `/api/v1/members/:id` | Detail anggota | ✅ |
| C3 | `POST` | `/api/v1/members` | Tambah anggota | ✅ |
| C4 | `PUT` | `/api/v1/members/:id` | Update anggota | ✅ |
| C5 | `DELETE` | `/api/v1/members/:id` | Hapus anggota | ✅ |
| D1 | `GET` | `/api/v1/loans` | Riwayat transaksi | ✅ |
| D2 | `GET` | `/api/v1/loans/:id` | Detail transaksi | ✅ |
| D3 | `POST` | `/api/v1/loans` | Peminjaman buku ⭐ | ✅ |
| D4 | `PATCH` | `/api/v1/loans/:id/return` | Pengembalian buku ⭐ | ✅ |
| E1 | `GET` | `/api/v1/dashboard/stats` | Statistik dashboard | ✅ |

## Design Decisions

| # | Keputusan | Alternatif | Alasan |
|---|-----------|-----------|--------|
| 1 | `PATCH` untuk return, bukan `POST /returns` | `POST /api/v1/returns` | Semantik: return adalah update existing loan, bukan create resource baru. PATCH karena hanya update sebagian field |
| 2 | Return tanpa request body | Body dengan `returnDate` | Tanggal pengembalian selalu hari ini, tidak perlu input manual. Mengurangi kemungkinan manipulasi tanggal |
| 3 | `400` untuk business rule violations | `422` | `422` untuk format/type error (Zod), `400` untuk business logic rejection. Pembagian tanggung jawab yang jelas |
| 4 | `409` untuk double return | `400` | `409 Conflict` lebih semantik: resource sudah dalam state yang bertentangan dengan operasi yang diminta |
| 5 | Return semua violations sekaligus | Return hanya yang pertama | Soal eksplisit minta pesan spesifik. Returning all violations sekaligus mengurangi round-trip dan memberikan UX lebih baik |
| 6 | `displayStatus` sebagai computed field di response | Hanya return `status` dari DB | Front-end tidak perlu menghitung ulang apakah transaksi overdue. API bertanggung jawab atas business logic |
| 7 | Nested object untuk member/book di loan response | Flat structure dengan `memberName`, `bookTitle` | Lebih structured, front-end bisa navigate ke detail. Avoid data denormalization |
| 8 | `availableCopies` di-include di loan response | Tidak include | Petugas langsung tahu sisa stok setelah peminjaman/pengembalian, tanpa perlu request tambahan |
