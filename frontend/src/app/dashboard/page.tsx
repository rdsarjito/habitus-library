'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { dashboardApi, getErrorMessage } from '@/lib/api';
import type { DashboardStats } from '@/types/api';
import { PageHeader } from '@/components/ui/page-header';
import { SummaryCards, type SummaryCardItem } from '@/components/ui/summary-cards';
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Library,
  Coins,
  ShieldAlert,
  ArrowRight,
  BookCheck,
  UserCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const summaryItems: SummaryCardItem[] = stats
    ? [
        {
          label: 'Total Judul Buku',
          value: stats.books.total,
          subValue: `${stats.books.availableCopies} dari ${stats.books.totalCopies} eksemplar tersedia`,
          icon: BookOpen,
          color: 'blue',
        },
        {
          label: 'Anggota Terdaftar',
          value: stats.members.total,
          subValue: `${stats.members.active} aktif • ${stats.members.inactive} nonaktif`,
          icon: Users,
          color: 'emerald',
        },
        {
          label: 'Peminjaman Aktif',
          value: stats.loans.active,
          subValue: `${stats.loans.returned} buku selesai dikembalikan`,
          icon: ArrowLeftRight,
          color: 'amber',
        },
        {
          label: 'Peminjaman Terlambat',
          value: stats.loans.overdue,
          subValue:
            stats.loans.overdue > 0
              ? 'Memerlukan penagihan segera'
              : 'Semua tepat waktu',
          icon: AlertTriangle,
          color: 'rose',
          isAlert: stats.loans.overdue > 0,
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        modulePath="Ringkasan"
        title="Dashboard Utama"
        subtitle={`Selamat datang kembali, ${user?.name || 'Petugas'}!`}
        icon={Library}
        extraAction={
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 h-11 px-4 bg-white border border-slate-200/80 text-slate-700 hover:text-[#8d1231] hover:border-[#8d1231]/30 hover:bg-red-50/50 rounded-xl transition-all font-bold text-xs shadow-xs active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#8d1231]' : ''}`} />
            <span>Perbarui Data</span>
          </button>
        }
      />

      {/* Error notification */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200/80 p-4 text-sm font-semibold text-red-700 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <SummaryCards items={summaryItems} loading={loading && !stats} />

      {/* Extended Metrics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fine Collection Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              Total Denda Terkumpul
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <div className="my-5">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              Rp {Number(stats?.fines.totalAmount || 0).toLocaleString('id-ID')}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Dari {stats?.fines.totalTransactions || 0} transaksi pengembalian terlambat
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Tarif Keterlambatan</span>
            <span className="text-[#8d1231]">Rp 1.000 / hari</span>
          </div>
        </div>

        {/* Quick Operations / Navigation Shortcuts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                Aksi Cepat & Navigasi
              </h3>
              <span className="text-xs font-bold text-[#8d1231]">Pintasan Petugas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/dashboard/loans"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-[#8d1231]/30 hover:bg-red-50/30 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-[#8d1231] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#8d1231] transition-colors">
                      Peminjaman Buku
                    </p>
                    <p className="text-[11px] text-slate-400">Buat transaksi baru</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#8d1231] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/returns"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                      Pengembalian Buku
                    </p>
                    <p className="text-[11px] text-slate-400">Proses & hitung denda</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/books"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      Katalog Buku
                    </p>
                    <p className="text-[11px] text-slate-400">Kelola stok & kategori</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/members"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      Data Anggota
                    </p>
                    <p className="text-[11px] text-slate-400">Status & nomor anggota</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
