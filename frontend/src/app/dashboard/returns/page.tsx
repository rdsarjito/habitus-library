'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { loansApi, getErrorMessage } from '@/lib/api';
import type { Loan, LoanQuery, PaginationMeta } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Loader2,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Clock,
} from 'lucide-react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'OVERDUE') {
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
        <AlertTriangle className="h-3 w-3" />
        Terlambat
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
      <Clock className="h-3 w-3" />
      Dipinjam
    </Badge>
  );
}

export default function ReturnsPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState<LoanQuery>({
    page: 1,
    perPage: 10,
    status: 'BORROWED',
    sort: 'dueDate',
    order: 'asc',
  });

  // Return dialog
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnLoan, setReturnLoan] = useState<Loan | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loansApi.getAll(query);
      // Filter only active (BORROWED + OVERDUE)
      const active = (res.data || []).filter(
        (l) => l.displayStatus === 'BORROWED' || l.displayStatus === 'OVERDUE'
      );
      setLoans(active);
      setMeta(res.meta || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { fetchLoans(); }, [fetchLoans]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, memberId: searchInput || undefined, page: 1 }));
  };

  const handleReturn = async () => {
    if (!returnLoan) return;
    setReturnLoading(true);
    try {
      const res = await loansApi.returnLoan(returnLoan.id);
      const lateDays = res.data?.lateDays ?? 0;
      const fineAmount = res.data?.fineAmount ?? 0;
      if (lateDays > 0) {
        toast.warning(
          `Buku dikembalikan terlambat ${lateDays} hari. Denda: Rp ${Number(fineAmount).toLocaleString('id-ID')}`
        );
      } else {
        toast.success('Buku berhasil dikembalikan tepat waktu');
      }
      setReturnOpen(false);
      fetchLoans();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReturnLoading(false);
    }
  };

  const overduCount = loans.filter((l) => l.displayStatus === 'OVERDUE').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pengembalian Buku</h2>
          <p className="mt-1 text-slate-500">Proses pengembalian buku yang sedang dipinjam</p>
        </div>
        {overduCount > 0 && (
          <Badge variant="secondary" className="bg-red-100 text-red-700 gap-1.5 px-3 py-1.5 text-sm">
            <AlertTriangle className="h-4 w-4" />
            {overduCount} buku terlambat
          </Badge>
        )}
      </div>

      {/* Search */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari nama anggota..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="outline">Cari</Button>
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setSearchInput(''); setQuery((p) => ({ ...p, memberId: undefined, page: 1 })); }}
              >
                Reset
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <ArrowLeftRight className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">Tidak ada peminjaman aktif</p>
              <p className="text-sm">Semua buku sudah dikembalikan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Buku</TableHead>
                    <TableHead>Tanggal Pinjam</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id} className={loan.displayStatus === 'OVERDUE' ? 'bg-red-50/50' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{loan.member.name}</p>
                          <p className="text-xs text-slate-400">{loan.member.memberNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{loan.book.title}</p>
                          <p className="text-xs text-slate-400">{loan.book.author}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{formatDate(loan.loanDate)}</TableCell>
                      <TableCell className={loan.displayStatus === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-slate-600'}>
                        {formatDate(loan.dueDate)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={loan.displayStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => { setReturnLoan(loan); setReturnOpen(true); }}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Kembalikan
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">
                Halaman {meta.page} dari {meta.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery((p) => ({ ...p, page: p.page! - 1 }))}
                  disabled={meta.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery((p) => ({ ...p, page: p.page! + 1 }))}
                  disabled={meta.page >= meta.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Return Confirmation Dialog */}
      <AlertDialog open={returnOpen} onOpenChange={setReturnOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengembalian</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>
                Kembalikan buku <strong>&quot;{returnLoan?.book.title}&quot;</strong> yang dipinjam oleh{' '}
                <strong>{returnLoan?.member.name}</strong>?
              </span>
              {returnLoan?.displayStatus === 'OVERDUE' && (
                <span className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 mt-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Buku ini terlambat. Denda akan dihitung otomatis.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={returnLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleReturn} disabled={returnLoading}>
              {returnLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Konfirmasi Pengembalian
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
