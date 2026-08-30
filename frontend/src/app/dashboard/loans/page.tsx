'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { loansApi, getErrorMessage } from '@/lib/api';
import type { Loan, LoanQuery, PaginationMeta } from '@/types/api';
import { LoanCreateDialog } from './loan-create-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  Loader2,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  if (status === 'OVERDUE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-red-50 text-[#8d1231] border border-red-200/60 animate-pulse">
        <AlertTriangle className="h-3.5 w-3.5 text-[#8d1231]" />
        <span>Terlambat</span>
      </span>
    );
  }
  if (status === 'RETURNED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <span>Dikembalikan</span>
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState<LoanQuery>({
    page: 1,
    perPage: 10,
    sort: 'createdAt',
    order: 'desc',
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
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

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleStatusFilter = (status: string) => {
    setQuery((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : (status as LoanQuery['status']),
      page: 1,
    }));
  };

  const handleReset = () => {
    setQuery({ page: 1, perPage: 10, sort: 'createdAt', order: 'desc' });
  };

  const handleReturnClick = (loan: Loan) => {
    setSelectedLoan(loan);
    setReturnOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedLoan) return;
    setReturnLoading(true);
    try {
      const res = await loansApi.returnLoan(selectedLoan.id);
      const fine = res.data?.fineAmount ? Number(res.data.fineAmount) : 0;
      if (fine > 0) {
        toast.warning(
          `Buku berhasil dikembalikan. Denda keterlambatan: Rp ${fine.toLocaleString('id-ID')} (${res.data?.lateDays || 0} hari)`
        );
      } else {
        toast.success('Buku berhasil dikembalikan tepat waktu');
      }
      setReturnOpen(false);
      setSelectedLoan(null);
      fetchLoans();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        modulePath="Sirkulasi"
        title="Daftar Peminjaman"
        subtitle="Pantau status transaksi peminjaman, jatuh tempo, dan riwayat buku"
        icon={ArrowLeftRight}
        actionLabel="Pinjam Buku"
        actionIcon={<Plus className="w-4 h-4" />}
        onActionClick={() => setCreateOpen(true)}
      />

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Filter dan urutkan status transaksi peminjaman..."
        searchValue=""
        onSearchChange={() => {}}
        onReset={handleReset}
        isLoading={loading}
      >
        <div className="w-full sm:w-52">
          <Select
            value={query.status || 'all'}
            onValueChange={(val) => handleStatusFilter(val || "all")}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200/80 text-xs font-bold text-slate-700">
              <SelectValue placeholder="Semua Status Transaksi">
                {(value: string | null) => {
                  const labels: Record<string, string> = {
                    all: "Semua Status",
                    BORROWED: "Dipinjam (Aktif)",
                    OVERDUE: "Terlambat (Overdue)",
                    RETURNED: "Dikembalikan (Selesai)",
                  };
                  return labels[value || "all"] || "Semua Status Transaksi";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all" className="text-xs font-semibold">Semua Status</SelectItem>
              <SelectItem value="BORROWED" className="text-xs font-semibold text-amber-700">Dipinjam (Aktif)</SelectItem>
              <SelectItem value="OVERDUE" className="text-xs font-semibold text-red-700">Terlambat (Overdue)</SelectItem>
              <SelectItem value="RETURNED" className="text-xs font-semibold text-emerald-700">Dikembalikan (Selesai)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-52">
          <Select
            value={`${query.sort}-${query.order}`}
            onValueChange={(val) => {
              if (!val) return;
              const [sort, order] = val.split('-') as [LoanQuery['sort'], LoanQuery['order']];
              setQuery((prev) => ({ ...prev, sort, order, page: 1 }));
            }}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200/80 text-xs font-bold text-slate-700">
              <SelectValue placeholder="Urutan">
                {(value: string | null) => {
                  const labels: Record<string, string> = {
                    "createdAt-desc": "Terbaru Dibuat",
                    "dueDate-asc": "Jatuh Tempo Terdekat",
                    "dueDate-desc": "Jatuh Tempo Terjauh",
                    "loanDate-desc": "Tanggal Pinjam",
                  };
                  return labels[value || "createdAt-desc"] || "Urutan";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="createdAt-desc" className="text-xs font-semibold">Terbaru Dibuat</SelectItem>
              <SelectItem value="dueDate-asc" className="text-xs font-semibold">Jatuh Tempo Terdekat</SelectItem>
              <SelectItem value="dueDate-desc" className="text-xs font-semibold">Jatuh Tempo Terjauh</SelectItem>
              <SelectItem value="loanDate-desc" className="text-xs font-semibold">Tanggal Pinjam</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      {/* Table Card */}
      <div className="kpi-table-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#8d1231]" />
            <p className="text-xs font-bold text-slate-400">Memuat transaksi peminjaman...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#8d1231] flex items-center justify-center mb-3">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-800">Tidak ada transaksi ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Belum ada data peminjaman yang cocok dengan filter yang dipilih.
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
                  <th>Denda</th>
                  <th className="text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => {
                  const fine = loan.fineAmount ? Number(loan.fineAmount) : 0;
                  const isReturned = loan.status === 'RETURNED';
                  return (
                    <tr key={loan.id}>
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
                      <td className="text-xs font-semibold text-slate-600">
                        {formatDate(loan.dueDate)}
                      </td>
                      <td>
                        <StatusBadge status={loan.displayStatus || loan.status} />
                      </td>
                      <td>
                        {fine > 0 ? (
                          <div>
                            <span className="text-xs font-black text-[#8d1231]">
                              Rp {fine.toLocaleString('id-ID')}
                            </span>
                            <p className="text-[10px] font-semibold text-red-500">
                              {loan.lateDays} hari telat
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">—</span>
                        )}
                      </td>
                      <td className="text-left whitespace-nowrap">
                        {!isReturned ? (
                          <button
                            onClick={() => handleReturnClick(loan)}
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold text-[#8d1231] bg-red-50 hover:bg-[#8d1231] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                            title="Proses Pengembalian"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Kembalikan</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">
                            {loan.returnDate ? `Selesai ${formatDate(loan.returnDate)}` : 'Selesai'}
                          </span>
                        )}
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
              <span className="font-black text-slate-800">{meta.total}</span> transaksi
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

      {/* Create Dialog */}
      <LoanCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchLoans}
      />

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
                Apakah Anda yakin ingin memproses pengembalian buku{' '}
                <strong className="text-slate-800">&quot;{selectedLoan?.book?.title}&quot;</strong> oleh{' '}
                <strong className="text-slate-800">{selectedLoan?.member?.name}</strong>?
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          {selectedLoan && selectedLoan.displayStatus === 'OVERDUE' && (
            <div className="rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-xs text-red-700 flex items-center gap-2.5 font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#8d1231]" />
              <span>
                Peringatan: Peminjaman ini telah melewati jatuh tempo. Sistem akan otomatis menghitung denda Rp 1.000 / hari.
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
              onClick={handleConfirmReturn}
              disabled={returnLoading}
              className="rounded-xl h-11 px-6 font-black text-xs text-white bg-gradient-to-r from-[#8d1231] to-[#cc1f39] hover:from-[#a01538] hover:to-[#e0243f] shadow-lg shadow-[#8d1231]/25"
            >
              {returnLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Proses Pengembalian'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
