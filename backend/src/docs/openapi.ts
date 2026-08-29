

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Library Management System API',
    version: '1.0.0',
    description:
      'REST API for managing library books, members, and loan transactions. ' +
      'All endpoints (except login) require JWT authentication via Bearer token.',
    contact: { name: 'Ramadhani Nur Sarjito' },
  },
  servers: [{ url: '/api/v1', description: 'API v1' }],
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      // ── Response Envelopes ──
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          perPage: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 16 },
          totalPages: { type: 'integer', example: 2 },
        },
      },
      // ── Models ──
      Book: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Clean Code' },
          author: { type: 'string', example: 'Robert C. Martin' },
          isbn: { type: 'string', example: '9780132350884' },
          publisher: { type: 'string', example: 'Prentice Hall' },
          yearPublished: { type: 'integer', example: 2008 },
          category: { type: 'string', example: 'Programming' },
          totalCopies: { type: 'integer', example: 3 },
          availableCopies: { type: 'integer', example: 2 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BookInput: {
        type: 'object',
        required: ['title', 'author', 'isbn', 'publisher', 'yearPublished', 'category', 'totalCopies'],
        properties: {
          title: { type: 'string', minLength: 1 },
          author: { type: 'string', minLength: 1 },
          isbn: { type: 'string', description: '10 or 13 digit ISBN' },
          publisher: { type: 'string', minLength: 1 },
          yearPublished: { type: 'integer', minimum: 1000 },
          category: { type: 'string', minLength: 1 },
          totalCopies: { type: 'integer', minimum: 1 },
        },
      },
      Member: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          memberNumber: { type: 'string', example: 'MBR-2026-001' },
          name: { type: 'string', example: 'Budi Santoso' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', example: '081234567890' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      MemberInput: {
        type: 'object',
        required: ['memberNumber', 'name', 'email', 'phone'],
        properties: {
          memberNumber: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', minLength: 1 },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
      },
      Loan: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          memberId: { type: 'string', format: 'uuid' },
          bookId: { type: 'string', format: 'uuid' },
          loanDate: { type: 'string', format: 'date' },
          dueDate: { type: 'string', format: 'date' },
          returnDate: { type: 'string', format: 'date', nullable: true },
          status: { type: 'string', enum: ['BORROWED', 'RETURNED'] },
          displayStatus: { type: 'string', enum: ['BORROWED', 'RETURNED', 'OVERDUE'] },
          lateDays: { type: 'integer', example: 0 },
          fineAmount: { type: 'number', nullable: true, example: null },
          member: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              memberNumber: { type: 'string' },
            },
          },
          book: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              author: { type: 'string' },
              isbn: { type: 'string' },
            },
          },
        },
      },
      DashboardStats: {
        type: 'object',
        properties: {
          books: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 16 },
              totalCopies: { type: 'integer', example: 44 },
              availableCopies: { type: 'integer', example: 37 },
            },
          },
          members: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 6 },
              active: { type: 'integer', example: 5 },
              inactive: { type: 'integer', example: 1 },
            },
          },
          loans: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 8 },
              active: { type: 'integer', example: 6 },
              overdue: { type: 'integer', example: 1 },
              returned: { type: 'integer', example: 2 },
            },
          },
          fines: {
            type: 'object',
            properties: {
              totalAmount: { type: 'number', example: 3000 },
              totalTransactions: { type: 'integer', example: 1 },
            },
          },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    // ════════════════════════════════════
    //  AUTH
    // ════════════════════════════════════
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login',
        description: 'Authenticate with username and password to receive a JWT token.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'admin' },
                  password: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Login berhasil',
                  data: {
                    token: 'eyJhbGciOiJIUzI1NiIs...',
                    user: { id: 'uuid', username: 'admin', name: 'Admin Perpustakaan' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                example: {
                  success: false,
                  message: 'Username atau password salah',
                  errors: [{ code: 'UNAUTHORIZED', message: 'Username atau password salah' }],
                },
              },
            },
          },
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get profile',
        description: 'Get the profile of the currently authenticated user.',
        responses: {
          '200': {
            description: 'Profile data',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Profil pengguna berhasil diambil',
                  data: { id: 'uuid', username: 'admin', name: 'Admin Perpustakaan', createdAt: '2026-08-29T00:00:00.000Z' },
                },
              },
            },
          },
          '401': { description: 'Not authenticated' },
        },
      },
    },

    // ════════════════════════════════════
    //  BOOKS
    // ════════════════════════════════════
    '/books': {
      get: {
        tags: ['Books'],
        summary: 'List books',
        description: 'Get a paginated list of books with optional search and category filter.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by title, author, or ISBN (case-insensitive)' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'perPage', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'sort', in: 'query', schema: { type: 'string', default: 'createdAt' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          '200': {
            description: 'List of books with pagination',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Data buku berhasil diambil',
                  data: [{ id: 'uuid', title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', publisher: 'Prentice Hall', yearPublished: 2008, category: 'Programming', totalCopies: 3, availableCopies: 2 }],
                  meta: { page: 1, perPage: 10, total: 16, totalPages: 2 },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Books'],
        summary: 'Create a book',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BookInput' } } } },
        responses: {
          '201': { description: 'Book created', content: { 'application/json': { example: { success: true, message: 'Buku berhasil ditambahkan', data: { id: 'uuid', title: 'New Book', availableCopies: 3 } } } } },
          '409': { description: 'Duplicate ISBN', content: { 'application/json': { example: { success: false, message: 'ISBN "9780132350884" sudah terdaftar', errors: [{ code: 'CONFLICT', message: 'ISBN sudah terdaftar' }] } } } },
          '422': { description: 'Validation error', content: { 'application/json': { example: { success: false, message: 'Validasi gagal', errors: [{ code: 'VALIDATION_ERROR', field: 'title', message: 'Judul buku wajib diisi' }] } } } },
        },
      },
    },
    '/books/categories': {
      get: {
        tags: ['Books'],
        summary: 'List categories',
        description: 'Get a list of distinct book categories.',
        responses: {
          '200': { description: 'List of categories', content: { 'application/json': { example: { success: true, data: ['Programming', 'Fiction', 'Science', 'History', 'Business', 'Self-Help'] } } } },
        },
      },
    },
    '/books/{id}': {
      get: {
        tags: ['Books'],
        summary: 'Get book by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Book details' },
          '404': { description: 'Book not found', content: { 'application/json': { example: { success: false, message: 'Buku tidak ditemukan', errors: [{ code: 'NOT_FOUND', message: 'Buku tidak ditemukan' }] } } } },
        },
      },
      put: {
        tags: ['Books'],
        summary: 'Update a book',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BookInput' } } } },
        responses: {
          '200': { description: 'Book updated' },
          '404': { description: 'Book not found' },
          '409': { description: 'Duplicate ISBN' },
          '422': { description: 'Validation error' },
        },
      },
      delete: {
        tags: ['Books'],
        summary: 'Delete a book',
        description: 'Delete a book. Fails if the book has any loan records.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Book deleted', content: { 'application/json': { example: { success: true, message: 'Buku berhasil dihapus' } } } },
          '400': { description: 'Book has loans', content: { 'application/json': { example: { success: false, message: 'Buku tidak dapat dihapus karena memiliki riwayat peminjaman', errors: [{ code: 'BAD_REQUEST', message: 'Buku memiliki riwayat peminjaman' }] } } } },
        },
      },
    },

    // ════════════════════════════════════
    //  MEMBERS
    // ════════════════════════════════════
    '/members': {
      get: {
        tags: ['Members'],
        summary: 'List members',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name, member number, or email' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'perPage', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'List of members with pagination' },
        },
      },
      post: {
        tags: ['Members'],
        summary: 'Create a member',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MemberInput' } } } },
        responses: {
          '201': { description: 'Member created' },
          '409': { description: 'Duplicate email or member number', content: { 'application/json': { example: { success: false, message: 'Email "budi@example.com" sudah terdaftar', errors: [{ code: 'CONFLICT', message: 'Email sudah terdaftar' }] } } } },
          '422': { description: 'Validation error' },
        },
      },
    },
    '/members/{id}': {
      get: {
        tags: ['Members'],
        summary: 'Get member by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Member details' }, '404': { description: 'Member not found' } },
      },
      put: {
        tags: ['Members'],
        summary: 'Update a member',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MemberInput' } } } },
        responses: { '200': { description: 'Member updated' }, '404': { description: 'Not found' }, '409': { description: 'Duplicate' } },
      },
      delete: {
        tags: ['Members'],
        summary: 'Delete a member',
        description: 'Delete a member. Fails if the member has any loan records.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Member deleted' },
          '400': { description: 'Member has loans', content: { 'application/json': { example: { success: false, message: 'Anggota tidak dapat dihapus karena memiliki riwayat peminjaman', errors: [{ code: 'BAD_REQUEST', message: 'Anggota memiliki riwayat peminjaman' }] } } } },
        },
      },
    },

    // ════════════════════════════════════
    //  LOANS
    // ════════════════════════════════════
    '/loans': {
      get: {
        tags: ['Loans'],
        summary: 'List loans',
        description: 'Get loan history with optional filters. The `displayStatus` field is computed: loans past due date show as OVERDUE.',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['BORROWED', 'OVERDUE', 'RETURNED'] }, description: 'Filter by status (OVERDUE is computed)' },
          { name: 'memberId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by member' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'perPage', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: { '200': { description: 'List of loans with member and book details' } },
      },
      post: {
        tags: ['Loans'],
        summary: 'Create a loan (borrow a book)',
        description:
          'Create a new loan. The system validates ALL business rules and returns ALL violations at once. ' +
          'Stock is decremented atomically within a database transaction using SELECT FOR UPDATE.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['memberId', 'bookId'],
                properties: {
                  memberId: { type: 'string', format: 'uuid' },
                  bookId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Loan created successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Peminjaman berhasil dibuat',
                  data: {
                    id: 'uuid', memberId: 'uuid', bookId: 'uuid',
                    loanDate: '2026-08-28', dueDate: '2026-09-11',
                    returnDate: null, status: 'BORROWED', displayStatus: 'BORROWED',
                    lateDays: 0, fineAmount: null,
                    member: { id: 'uuid', name: 'Agus Pratama', memberNumber: 'MBR-2026-003' },
                    book: { id: 'uuid', title: 'Refactoring', author: 'Martin Fowler', isbn: '9780134757599' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Business rule violation(s)',
            content: {
              'application/json': {
                examples: {
                  maxLoans: {
                    summary: 'Maximum loans reached',
                    value: {
                      success: false,
                      message: 'Peminjaman tidak dapat dilakukan',
                      errors: [{ code: 'MEMBER_MAX_LOANS_REACHED', message: 'Anggota "Budi Santoso" sudah mencapai batas maksimal peminjaman (3 buku)' }],
                    },
                  },
                  multipleViolations: {
                    summary: 'Multiple violations at once',
                    value: {
                      success: false,
                      message: 'Peminjaman tidak dapat dilakukan',
                      errors: [
                        { code: 'MEMBER_INACTIVE', message: 'Anggota "Rudi Hermawan" berstatus nonaktif dan tidak dapat meminjam buku' },
                        { code: 'BOOK_OUT_OF_STOCK', message: 'Buku "Thinking, Fast and Slow" tidak tersedia (stok habis)' },
                      ],
                    },
                  },
                  hasOverdue: {
                    summary: 'Member has overdue books',
                    value: {
                      success: false,
                      message: 'Peminjaman tidak dapat dilakukan',
                      errors: [{ code: 'MEMBER_HAS_OVERDUE', message: 'Anggota "Siti Aminah" memiliki buku yang belum dikembalikan dan sudah melewati batas waktu' }],
                    },
                  },
                },
              },
            },
          },
          '404': { description: 'Member or book not found' },
        },
      },
    },
    '/loans/{id}': {
      get: {
        tags: ['Loans'],
        summary: 'Get loan by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Loan details with member and book data' }, '404': { description: 'Loan not found' } },
      },
    },
    '/loans/{id}/return': {
      patch: {
        tags: ['Loans'],
        summary: 'Return a book',
        description:
          'Mark a loan as returned. Late days and fines are calculated automatically. ' +
          'Stock is incremented atomically within a database transaction.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': {
            description: 'Book returned',
            content: {
              'application/json': {
                examples: {
                  onTime: {
                    summary: 'Returned on time',
                    value: {
                      success: true,
                      message: 'Buku berhasil dikembalikan tepat waktu',
                      data: { id: 'uuid', status: 'RETURNED', displayStatus: 'RETURNED', lateDays: 0, fineAmount: null },
                    },
                  },
                  late: {
                    summary: 'Returned late (with fine)',
                    value: {
                      success: true,
                      message: 'Buku berhasil dikembalikan (terlambat 6 hari, denda Rp 6.000)',
                      data: { id: 'uuid', status: 'RETURNED', displayStatus: 'RETURNED', lateDays: 6, fineAmount: 6000 },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Already returned',
            content: {
              'application/json': {
                example: {
                  success: false,
                  message: 'Buku "Refactoring" sudah dikembalikan pada 2026-08-28',
                  errors: [{ code: 'LOAN_ALREADY_RETURNED', message: 'Buku "Refactoring" sudah dikembalikan pada 2026-08-28' }],
                },
              },
            },
          },
          '404': { description: 'Loan not found' },
        },
      },
    },

    // ════════════════════════════════════
    //  DASHBOARD
    // ════════════════════════════════════
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get dashboard statistics',
        description: 'Returns aggregated library statistics including book counts, member counts, active loans, overdue count, and fine totals.',
        responses: {
          '200': {
            description: 'Dashboard statistics',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/DashboardStats' } } } } },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Authentication', description: 'Login and user profile' },
    { name: 'Books', description: 'Book management (CRUD, search, filter)' },
    { name: 'Members', description: 'Member management (CRUD, search, filter)' },
    { name: 'Loans', description: 'Loan transactions (borrow, return, history)' },
    { name: 'Dashboard', description: 'Library statistics' },
  ],
};

export default spec;
