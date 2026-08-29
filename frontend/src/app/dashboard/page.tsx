'use client';

import { useAuthStore } from '@/stores/auth.store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Selamat datang, {user?.name}! 👋
      </h1>
      <p className="mt-1 text-slate-500">
        Dashboard statistik akan diimplementasikan di langkah berikutnya.
      </p>
    </div>
  );
}
