'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { loansApi, getErrorMessage } from '@/lib/api';
import type { Loan, LoanQuery, PaginationMeta } from '@/types/api';
import { LoanCreateDialog } from './loan-create-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Loader2, ArrowLeftRight, ChevronLeft, ChevronRight, RotateCcw,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    BORROWED: { label: 'Dipinjam', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
    OVERDUE: { label: 'Terlambat', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
    RETURNED: { label: 'Dikembalikan', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  };
  const c = config[status] || config.BORROWED;
  return <Badge variant="secondary" className={c.className}>{c.label}</Badge>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState<LoanQuery>({ page: 1, perPage: 10, sort: 'createdAt', order: 'desc' });

  const [createOpen, setCreateOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnLoan, setReturnLoan] = useState<Loan | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loansApi.getAll(query);
      setLoans(res.data || []);
      setMeta(res.meta || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const handleStatusFilter = (status: string | null) => {
    setQuery((prev) => ({
      ...prev,
      status: (!status || status === 'all') ? undefined : status as LoanQuery['status'],
      page: 1,
    }));
  };

  const handleReturn = async () => {
    if (!returnLoan) return;
    setReturnLoading(true);
    try {
      const res = await loansApi.returnLoan(returnLoan.id);
      toast.success(res.message);
      setReturnOpen(false);
      fetchLoans();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Peminjaman</h1>
          <p className="mt-1 text-slate-500">Kelola peminjaman dan pengembalian buku</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Pinjam Buku
        </Button>
      </div>

      {/* Filter */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-4">
          <Select value={query.status || 'all'} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Semua Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="BORROWED">Dipinjam</SelectItem>
              <SelectItem value="OVERDUE">Terlambat</SelectItem>
              <SelectItem value="RETURNED">Dikembalikan</SelectItem>
            </SelectContent>
          </Select>
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
              <p className="text-lg font-medium">Tidak ada data peminjaman</p>
              <p className="text-sm">Buat peminjaman baru dengan menekan tombol &quot;Pinjam Buku&quot;</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anggota</TableHead>
                  <TableHead>Buku</TableHead>
                  <TableHead>Tgl Pinjam</TableHead>
                  <TableHead>Tgl Tempo</TableHead>
                  <TableHead>Tgl Kembali</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Denda</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{loan.member.name}</p>
                        <p className="text-xs text-slate-500">{loan.member.memberNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{loan.book.title}</p>
                        <p className="text-xs text-slate-500">{loan.book.author}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{formatDate(loan.loanDate)}</TableCell>
                    <TableCell className="text-sm text-slate-600">{formatDate(loan.dueDate)}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {loan.returnDate ? formatDate(loan.returnDate) : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={loan.displayStatus} />
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {loan.fineAmount ? (
                        <span className="font-medium text-red-600">Rp {Number(loan.fineAmount).toLocaleString('id-ID')}</span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {loan.displayStatus !== 'RETURNED' && (
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { setReturnLoan(loan); setReturnOpen(true); }}>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Kembalikan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">Menampilkan {loans.length} dari {meta.total} peminjaman</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) - 1 }))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600">{meta.page} / {meta.totalPages}</span>
                <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) + 1 }))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <LoanCreateDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={fetchLoans} />

      {/* Return Confirmation */}
      <AlertDialog open={returnOpen} onOpenChange={setReturnOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kembalikan Buku</AlertDialogTitle>
            <AlertDialogDescription>
              Kembalikan buku <strong>&quot;{returnLoan?.book.title}&quot;</strong> yang dipinjam oleh <strong>{returnLoan?.member.name}</strong>?
              {returnLoan?.displayStatus === 'OVERDUE' && (
                <span className="block mt-2 text-red-600 font-medium">
                  ⚠️ Peminjaman ini sudah melewati batas waktu. Denda akan dihitung otomatis.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={returnLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleReturn} disabled={returnLoading}>
              {returnLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</> : 'Kembalikan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
