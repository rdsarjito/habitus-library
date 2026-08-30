'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { loansApi, getErrorMessage } from '@/lib/api';
import type { Loan, LoanQuery, PaginationMeta } from '@/types/api';
import { PageHeader } from '@/components/ui/page-header';
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
  Loader2,
  RotateCcw,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-red-50 text-[#8d1231] border border-red-200/60 animate-pulse">
        <AlertTriangle className="h-3.5 w-3.5 text-[#8d1231]" />
        <span>Terlambat</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
      <Clock className="h-3.5 w-3.5 text-amber-600" />
      <span>Dipinjam</span>
    </span>
  );
}

export default function ReturnsPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState<LoanQuery>({
    page: 1,
    perPage: 10,
    status: 'BORROWED',
    sort: 'dueDate',
    order: 'asc',
  });

  const [returnLoan, setReturnLoan] = useState<Loan | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loansApi.getAll(query);
      const activeLoans = (res.data || []).filter((l) => l.status !== 'RETURNED');
      setLoans(activeLoans);
      setMeta(res.meta || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleReturn = async () => {
    if (!returnLoan) return;
    setReturnLoading(true);
    try {
      const res = await loansApi.returnLoan(returnLoan.id);
      const lateDays = res.data?.lateDays ?? 0;
      const fineAmount = res.data?.fineAmount ? Number(res.data.fineAmount) : 0;

      if (lateDays > 0) {
        toast.warning(
          `Buku dikembalikan terlambat ${lateDays} hari. Denda: Rp ${fineAmount.toLocaleString('id-ID')}`
        );
      } else {
        toast.success('Buku berhasil dikembalikan tepat waktu');
      }
      setReturnOpen(false);
      setReturnLoan(null);
      fetchLoans();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReturnLoading(false);
    }
  };

  const overdueCount = loans.filter((l) => l.displayStatus === 'OVERDUE').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        modulePath="Sirkulasi"
        title="Pengembalian Buku"
        subtitle="Proses pengembalian buku pinjaman aktif dan perhitungan denda otomatis"
        icon={RotateCcw}
        extraAction={
          overdueCount > 0 ? (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-red-50 text-[#8d1231] border border-red-200/80 rounded-xl text-xs font-black animate-pulse shadow-xs">
              <AlertTriangle className="w-4 h-4 text-[#8d1231]" />
              <span>{overdueCount} Buku Melewati Batas Waktu</span>
            </div>
          ) : null
        }
      />

      {/* Table Card */}
      <div className="kpi-table-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#8d1231]" />
            <p className="text-xs font-bold text-slate-400">Memuat data pengembalian...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-800">Tidak ada peminjaman aktif</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Semua buku yang dipinjam telah dikembalikan ke perpustakaan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table>
              <thead>
                <tr>
                  <th>Peminjam (Anggota)</th>
                  <th>Judul Buku</th>
                  <th>Tgl Pinjam</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                  <th className="text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const isOverdue = loan.displayStatus === 'OVERDUE';
                  return (
                    <tr
                      key={loan.id}
                      className={isOverdue ? 'bg-red-50/20 hover:bg-red-50/40' : ''}
                    >
                      <td className="min-w-[180px]">
                        <p className="font-black text-slate-900">{loan.member?.name}</p>
                        <p className="text-[11px] font-mono font-bold text-slate-400">
                          {loan.member?.memberNumber}
                        </p>
                      </td>
                      <td className="min-w-[200px]">
                        <p className="font-bold text-slate-800 line-clamp-1">{loan.book?.title}</p>
                        <p className="text-[11px] font-medium text-slate-400">{loan.book?.author}</p>
                      </td>
                      <td className="text-xs font-semibold text-slate-600">
                        {formatDate(loan.loanDate)}
                      </td>
                      <td
                        className={`text-xs font-bold ${
                          isOverdue ? 'text-[#8d1231]' : 'text-slate-600'
                        }`}
                      >
                        {formatDate(loan.dueDate)}
                      </td>
                      <td>
                        <StatusBadge status={loan.displayStatus || loan.status} />
                      </td>
                      <td className="text-left whitespace-nowrap">
                        <button
                          onClick={() => {
                            setReturnLoan(loan);
                            setReturnOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-black text-white bg-gradient-to-r from-[#8d1231] to-[#cc1f39] hover:from-[#a01538] hover:to-[#e0243f] shadow-md shadow-[#8d1231]/20 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Kembalikan Buku</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-xs font-semibold text-slate-500">
              Menampilkan <span className="font-black text-slate-800">{loans.length}</span> dari{' '}
              <span className="font-black text-slate-800">{meta.total}</span> transaksi aktif
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.page <= 1 || loading}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page! - 1 }))}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#8d1231] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-slate-700 px-2">
                Halaman {meta.page} dari {meta.totalPages}
              </span>
              <button
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page! + 1 }))}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#8d1231] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Return Confirmation Dialog */}
      <AlertDialog open={returnOpen} onOpenChange={setReturnOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-100 p-6 shadow-2xl">
          <AlertDialogHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-black text-slate-900">
                Konfirmasi Pengembalian Buku
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-slate-500 mt-1">
                Apakah Anda ingin mencatat pengembalian buku{' '}
                <strong className="text-slate-800">&quot;{returnLoan?.book?.title}&quot;</strong> yang
                dipinjam oleh <strong className="text-slate-800">{returnLoan?.member?.name}</strong>?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          {returnLoan?.displayStatus === 'OVERDUE' && (
            <div className="rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-xs text-red-700 flex items-center gap-2.5 font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#8d1231]" />
              <span>
                Peringatan: Buku ini melewati batas waktu jatuh tempo ({formatDate(returnLoan.dueDate)}). Denda Rp 1.000 / hari akan dihitung otomatis.
              </span>
            </div>
          )}

          <AlertDialogFooter className="pt-3 border-t border-slate-100 gap-2">
            <AlertDialogCancel
              disabled={returnLoading}
              className="rounded-xl h-11 px-5 font-bold text-xs border-slate-200"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReturn}
              disabled={returnLoading}
              className="rounded-xl h-11 px-6 font-black text-xs text-white bg-gradient-to-r from-[#8d1231] to-[#cc1f39] hover:from-[#a01538] hover:to-[#e0243f] shadow-lg shadow-[#8d1231]/25"
            >
              {returnLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Konfirmasi Pengembalian'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
