import { PrismaClient, MemberStatus, LoanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (in order to respect FK constraints)
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();

  // =====================
  // 1. Users (Petugas)
  // =====================
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: 'Admin Perpustakaan',
    },
  });
  console.log(`  ✅ User: ${admin.username} (password: admin123)`);

  // =====================
  // 2. Books (15+ buku, 5 kategori)
  // =====================
  const booksData = [
    // Programming (5 buku)
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', publisher: 'Prentice Hall', yearPublished: 2008, category: 'Programming', totalCopies: 5, availableCopies: 5 },
    { title: 'Design Patterns', author: 'Erich Gamma', isbn: '9780201633610', publisher: 'Addison-Wesley', yearPublished: 1994, category: 'Programming', totalCopies: 3, availableCopies: 3 },
    { title: 'The Pragmatic Programmer', author: 'David Thomas', isbn: '9780135957059', publisher: 'Addison-Wesley', yearPublished: 2019, category: 'Programming', totalCopies: 4, availableCopies: 4 },
    { title: 'Refactoring', author: 'Martin Fowler', isbn: '9780134757599', publisher: 'Addison-Wesley', yearPublished: 2018, category: 'Programming', totalCopies: 2, availableCopies: 2 },
    { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '9780596517748', publisher: "O'Reilly Media", yearPublished: 2008, category: 'Programming', totalCopies: 3, availableCopies: 3 },

    // Fiction (3 buku)
    { title: 'Laskar Pelangi', author: 'Andrea Hirata', isbn: '9789793062792', publisher: 'Bentang Pustaka', yearPublished: 2005, category: 'Fiction', totalCopies: 4, availableCopies: 4 },
    { title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', isbn: '9789799731234', publisher: 'Hasta Mitra', yearPublished: 1980, category: 'Fiction', totalCopies: 3, availableCopies: 3 },
    { title: 'Filosofi Teras', author: 'Henry Manampiring', isbn: '9786024246945', publisher: 'Kompas', yearPublished: 2018, category: 'Fiction', totalCopies: 2, availableCopies: 2 },

    // Science (3 buku)
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', publisher: 'Bantam', yearPublished: 1998, category: 'Science', totalCopies: 3, availableCopies: 3 },
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', publisher: 'Harper', yearPublished: 2015, category: 'Science', totalCopies: 4, availableCopies: 4 },
    { title: 'Cosmos', author: 'Carl Sagan', isbn: '9780345539434', publisher: 'Ballantine', yearPublished: 2013, category: 'Science', totalCopies: 2, availableCopies: 2 },

    // Business (2 buku)
    { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', isbn: '9781612680194', publisher: 'Plata Publishing', yearPublished: 2017, category: 'Business', totalCopies: 3, availableCopies: 3 },
    { title: 'The Lean Startup', author: 'Eric Ries', isbn: '9780307887894', publisher: 'Currency', yearPublished: 2011, category: 'Business', totalCopies: 2, availableCopies: 2 },

    // History (2 buku)
    { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393354324', publisher: 'W.W. Norton', yearPublished: 2017, category: 'History', totalCopies: 2, availableCopies: 2 },
    // Edge case: buku dengan stok 1 (untuk test race condition)
    { title: 'Sejarah Indonesia Modern', author: 'M.C. Ricklefs', isbn: '9789795263081', publisher: 'Gadjah Mada University Press', yearPublished: 2008, category: 'History', totalCopies: 1, availableCopies: 1 },
    // Edge case: buku dengan stok 0 (untuk test BOOK_OUT_OF_STOCK)
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', publisher: 'Farrar Straus Giroux', yearPublished: 2011, category: 'Science', totalCopies: 1, availableCopies: 0 },
  ];

  const books = await Promise.all(
    booksData.map((data) => prisma.book.create({ data }))
  );
  console.log(`  ✅ Books: ${books.length} buku ditambahkan`);

  // =====================
  // 3. Members (5+ anggota)
  // =====================
  const membersData = [
    { memberNumber: 'MBR-2026-001', name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567890', status: MemberStatus.ACTIVE },
    { memberNumber: 'MBR-2026-002', name: 'Siti Aminah', email: 'siti@email.com', phone: '081234567891', status: MemberStatus.ACTIVE },
    { memberNumber: 'MBR-2026-003', name: 'Agus Pratama', email: 'agus@email.com', phone: '081234567892', status: MemberStatus.ACTIVE },
    { memberNumber: 'MBR-2026-004', name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893', status: MemberStatus.ACTIVE },
    // Edge case: anggota nonaktif (untuk test MEMBER_INACTIVE)
    { memberNumber: 'MBR-2026-005', name: 'Rudi Hermawan', email: 'rudi@email.com', phone: '081234567894', status: MemberStatus.INACTIVE },
    { memberNumber: 'MBR-2026-006', name: 'Ani Wijaya', email: 'ani@email.com', phone: '081234567895', status: MemberStatus.ACTIVE },
  ];

  const members = await Promise.all(
    membersData.map((data) => prisma.member.create({ data }))
  );
  console.log(`  ✅ Members: ${members.length} anggota ditambahkan`);

  // =====================
  // 4. Loans (Sample transactions)
  // =====================
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };
  const daysFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  // Helper: find book/member by name
  const findBook = (title: string) => books.find((b) => b.title === title)!;
  const findMember = (name: string) => members.find((m) => m.name === name)!;

  const loansData = [
    // Budi: 3 pinjaman aktif (untuk test MEMBER_MAX_LOANS_REACHED)
    {
      memberId: findMember('Budi Santoso').id,
      bookId: findBook('Clean Code').id,
      loanDate: daysAgo(10),
      dueDate: daysFromNow(4),
      status: LoanStatus.BORROWED,
    },
    {
      memberId: findMember('Budi Santoso').id,
      bookId: findBook('Design Patterns').id,
      loanDate: daysAgo(5),
      dueDate: daysFromNow(9),
      status: LoanStatus.BORROWED,
    },
    {
      memberId: findMember('Budi Santoso').id,
      bookId: findBook('The Pragmatic Programmer').id,
      loanDate: daysAgo(3),
      dueDate: daysFromNow(11),
      status: LoanStatus.BORROWED,
    },

    // Siti: 1 pinjaman yang sudah OVERDUE (untuk test MEMBER_HAS_OVERDUE)
    {
      memberId: findMember('Siti Aminah').id,
      bookId: findBook('Laskar Pelangi').id,
      loanDate: daysAgo(20),
      dueDate: daysAgo(6),  // Sudah lewat 6 hari
      status: LoanStatus.BORROWED,
    },

    // Agus: 1 pinjaman aktif normal
    {
      memberId: findMember('Agus Pratama').id,
      bookId: findBook('Sapiens').id,
      loanDate: daysAgo(7),
      dueDate: daysFromNow(7),
      status: LoanStatus.BORROWED,
    },

    // Dewi: 2 pinjaman sudah dikembalikan (1 tepat waktu, 1 terlambat)
    {
      memberId: findMember('Dewi Lestari').id,
      bookId: findBook('Rich Dad Poor Dad').id,
      loanDate: daysAgo(30),
      dueDate: daysAgo(16),
      returnDate: daysAgo(18),  // Dikembalikan tepat waktu
      status: LoanStatus.RETURNED,
      lateDays: 0,
      fineAmount: null,
    },
    {
      memberId: findMember('Dewi Lestari').id,
      bookId: findBook('A Brief History of Time').id,
      loanDate: daysAgo(25),
      dueDate: daysAgo(11),
      returnDate: daysAgo(8),  // Terlambat 3 hari
      status: LoanStatus.RETURNED,
      lateDays: 3,
      fineAmount: 3000,
    },

    // Ani: 1 pinjaman aktif
    {
      memberId: findMember('Ani Wijaya').id,
      bookId: findBook('Filosofi Teras').id,
      loanDate: daysAgo(2),
      dueDate: daysFromNow(12),
      status: LoanStatus.BORROWED,
    },
  ];

  for (const loanData of loansData) {
    await prisma.loan.create({
      data: {
        ...loanData,
        lateDays: loanData.lateDays ?? 0,
        fineAmount: loanData.fineAmount ?? null,
      },
    });

    // Update availableCopies for active loans
    if (loanData.status === LoanStatus.BORROWED) {
      await prisma.book.update({
        where: { id: loanData.bookId },
        data: { availableCopies: { decrement: 1 } },
      });
    }
  }
  console.log(`  ✅ Loans: ${loansData.length} transaksi ditambahkan`);

  // =====================
  // Summary
  // =====================
  console.log('\n📊 Seed Summary:');
  console.log('  ┌─────────────────────────────────────────┐');
  console.log('  │ Edge cases yang sudah di-setup:          │');
  console.log('  │                                          │');
  console.log('  │ • Budi: 3 pinjaman aktif (batas maks)   │');
  console.log('  │ • Siti: 1 pinjaman overdue              │');
  console.log('  │ • Rudi: status INACTIVE                 │');
  console.log('  │ • "Thinking, Fast and Slow": stok 0     │');
  console.log('  │ • "Sejarah Indonesia Modern": stok 1    │');
  console.log('  │ • Dewi: 2 riwayat return (1 terlambat)  │');
  console.log('  └─────────────────────────────────────────┘');
  console.log('\n✅ Seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
