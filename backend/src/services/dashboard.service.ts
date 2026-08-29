import prisma from '../config/database';

export class DashboardService {
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalBooks,
      totalMembers,
      activeMembers,
      totalLoans,
      activeLoans,
      overdueLoans,
      returnedLoans,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.loan.count(),
      prisma.loan.count({ where: { status: 'BORROWED' } }),
      prisma.loan.count({ where: { status: 'BORROWED', dueDate: { lt: today } } }),
      prisma.loan.count({ where: { status: 'RETURNED' } }),
    ]);

    // Total available copies
    const bookStats = await prisma.book.aggregate({
      _sum: { totalCopies: true, availableCopies: true },
    });

    // Recent fines
    const fineStats = await prisma.loan.aggregate({
      where: { fineAmount: { not: null } },
      _sum: { fineAmount: true },
      _count: true,
    });

    return {
      books: {
        total: totalBooks,
        totalCopies: bookStats._sum.totalCopies || 0,
        availableCopies: bookStats._sum.availableCopies || 0,
      },
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: totalMembers - activeMembers,
      },
      loans: {
        total: totalLoans,
        active: activeLoans,
        overdue: overdueLoans,
        returned: returnedLoans,
      },
      fines: {
        totalAmount: fineStats._sum.fineAmount || 0,
        totalTransactions: fineStats._count,
      },
    };
  }
}

export default new DashboardService();
