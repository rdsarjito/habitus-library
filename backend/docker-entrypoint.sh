#!/bin/sh
set -e

echo "⏳ Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
  const existing = await p.user.count();
  if (existing > 0) { console.log('  ℹ️  Data already seeded, skipping'); return; }

  const hash = await bcrypt.hash('admin123', 12);
  await p.user.create({ data: { username: 'admin', password: hash, name: 'Administrator' } });

  const books = [
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', publisher: 'Prentice Hall', yearPublished: 2008, category: 'Programming', totalCopies: 3, availableCopies: 3 },
    { title: 'Design Patterns', author: 'Gang of Four', isbn: '9780201633610', publisher: 'Addison-Wesley', yearPublished: 1994, category: 'Programming', totalCopies: 2, availableCopies: 2 },
    { title: 'The Pragmatic Programmer', author: 'David Thomas', isbn: '9780135957059', publisher: 'Addison-Wesley', yearPublished: 2019, category: 'Programming', totalCopies: 3, availableCopies: 3 },
    { title: 'Refactoring', author: 'Martin Fowler', isbn: '9780134757599', publisher: 'Addison-Wesley', yearPublished: 2018, category: 'Programming', totalCopies: 2, availableCopies: 2 },
    { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '9780596517748', publisher: 'O\\'Reilly Media', yearPublished: 2008, category: 'Programming', totalCopies: 3, availableCopies: 3 },
    { title: 'Laskar Pelangi', author: 'Andrea Hirata', isbn: '9789793062792', publisher: 'Bentang Pustaka', yearPublished: 2005, category: 'Fiction', totalCopies: 4, availableCopies: 4 },
    { title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', isbn: '9789799731234', publisher: 'Hasta Mitra', yearPublished: 1980, category: 'Fiction', totalCopies: 3, availableCopies: 3 },
    { title: 'Filosofi Teras', author: 'Henry Manampiring', isbn: '9786024246945', publisher: 'Kompas', yearPublished: 2018, category: 'Fiction', totalCopies: 2, availableCopies: 2 },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', publisher: 'Bantam', yearPublished: 1998, category: 'Science', totalCopies: 3, availableCopies: 3 },
    { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', publisher: 'Harper', yearPublished: 2015, category: 'Science', totalCopies: 4, availableCopies: 4 },
    { title: 'Cosmos', author: 'Carl Sagan', isbn: '9780345539434', publisher: 'Ballantine', yearPublished: 2013, category: 'Science', totalCopies: 2, availableCopies: 2 },
    { title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', isbn: '9781612680194', publisher: 'Plata Publishing', yearPublished: 2017, category: 'Business', totalCopies: 3, availableCopies: 3 },
    { title: 'The Lean Startup', author: 'Eric Ries', isbn: '9780307887894', publisher: 'Currency', yearPublished: 2011, category: 'Business', totalCopies: 2, availableCopies: 2 },
    { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393354324', publisher: 'W.W. Norton', yearPublished: 2017, category: 'History', totalCopies: 2, availableCopies: 2 },
    { title: 'Sejarah Indonesia Modern', author: 'M.C. Ricklefs', isbn: '9789795263081', publisher: 'Gadjah Mada University Press', yearPublished: 2008, category: 'History', totalCopies: 1, availableCopies: 1 },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', publisher: 'Farrar Straus Giroux', yearPublished: 2011, category: 'Science', totalCopies: 1, availableCopies: 0 },
  ];
  await Promise.all(books.map(b => p.book.create({ data: b })));

  const members = [
    { memberNumber: 'MBR-2026-001', name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567890', status: 'ACTIVE' },
    { memberNumber: 'MBR-2026-002', name: 'Siti Aminah', email: 'siti@email.com', phone: '081234567891', status: 'ACTIVE' },
    { memberNumber: 'MBR-2026-003', name: 'Agus Pratama', email: 'agus@email.com', phone: '081234567892', status: 'ACTIVE' },
    { memberNumber: 'MBR-2026-004', name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893', status: 'ACTIVE' },
    { memberNumber: 'MBR-2026-005', name: 'Rudi Hermawan', email: 'rudi@email.com', phone: '081234567894', status: 'INACTIVE' },
    { memberNumber: 'MBR-2026-006', name: 'Ani Wijaya', email: 'ani@email.com', phone: '081234567895', status: 'ACTIVE' },
  ];
  await Promise.all(members.map(m => p.member.create({ data: m })));

  console.log('  ✅ Admin user, 16 books, 6 members seeded');
}

main().catch(e => { console.error('Seed error:', e.message); }).finally(() => p.\$disconnect());
" || echo "⚠️  Seed error (may already exist)"

echo "🚀 Starting server..."
exec node dist/server.js
