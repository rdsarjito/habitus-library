'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { dashboardApi, getErrorMessage } from '@/lib/api';
import type { DashboardStats } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  TrendingUp,
  Loader2,
  RefreshCw,
  BookCopy,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Selamat datang kembali, {user?.name}! 👋
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !stats && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Buku */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Buku
                </CardTitle>
                <div className="rounded-lg bg-blue-50 p-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.books.total}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.books.availableCopies} dari {stats.books.totalCopies} eksemplar tersedia
                </p>
              </CardContent>
            </Card>

            {/* Anggota Aktif */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Anggota Aktif
                </CardTitle>
                <div className="rounded-lg bg-emerald-50 p-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.members.active}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.members.inactive} nonaktif dari {stats.members.total} total
                </p>
              </CardContent>
            </Card>

            {/* Peminjaman Aktif */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Peminjaman Aktif
                </CardTitle>
                <div className="rounded-lg bg-amber-50 p-2">
                  <ArrowLeftRight className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.loans.active}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.loans.returned} sudah dikembalikan
                </p>
              </CardContent>
            </Card>

            {/* Overdue */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Terlambat
                </CardTitle>
                <div className={`rounded-lg p-2 ${stats.loans.overdue > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                  <AlertTriangle className={`h-4 w-4 ${stats.loans.overdue > 0 ? 'text-red-600' : 'text-slate-400'}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stats.loans.overdue > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {stats.loans.overdue}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  buku belum dikembalikan
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Koleksi */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <BookCopy className="h-5 w-5 text-blue-500" />
                  Koleksi Buku
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Judul</span>
                  <span className="font-medium">{stats.books.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Eksemplar</span>
                  <span className="font-medium">{stats.books.totalCopies}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tersedia</span>
                  <span className="font-medium text-emerald-600">{stats.books.availableCopies}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Dipinjam</span>
                  <span className="font-medium text-amber-600">{stats.books.totalCopies - stats.books.availableCopies}</span>
                </div>
              </CardContent>
            </Card>

            {/* Peminjaman */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                  Statistik Peminjaman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Transaksi</span>
                  <span className="font-medium">{stats.loans.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sedang Dipinjam</span>
                  <span className="font-medium text-blue-600">{stats.loans.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Dikembalikan</span>
                  <span className="font-medium text-emerald-600">{stats.loans.returned}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Terlambat</span>
                  <span className={`font-medium ${stats.loans.overdue > 0 ? 'text-red-600' : ''}`}>{stats.loans.overdue}</span>
                </div>
              </CardContent>
            </Card>

            {/* Denda */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Banknote className="h-5 w-5 text-emerald-500" />
                  Denda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Denda</span>
                  <span className="font-medium">
                    Rp {Number(stats.fines.totalAmount).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Transaksi Denda</span>
                  <span className="font-medium">{stats.fines.totalTransactions}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
