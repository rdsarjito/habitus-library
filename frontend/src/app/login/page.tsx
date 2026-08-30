'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { getErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, initialize, isInitialized } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi');
      return;
    }

    try {
      await login({ username: username.trim(), password });
      router.replace('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0a0f]">
        <Loader2 className="h-8 w-8 animate-spin text-[#cc1f39]" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1c080e] via-[#120508] to-[#0f0407] p-4 relative overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#8d1231]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#cc1f39]/15 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl p-2 sm:p-4">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-black/20 p-2.5 ring-4 ring-white/10">
            <Image src="/logo-transparent.png" alt="Habitus Library" width={44} height={44} className="object-contain" priority />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8d1231]/20 border border-[#8d1231]/40 text-[#ff8093] text-[11px] font-black uppercase tracking-widest mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sistem Manajemen</span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Perpustakaan
            </CardTitle>
            <CardDescription className="text-white/60 text-xs font-semibold mt-1">
              Portal Petugas — Masuk untuk mengelola sirkulasi
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/20 border border-red-500/30 p-3 text-xs font-bold text-red-300 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold text-white/80">
                Username Petugas
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username (cth: admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
                className="bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:border-[#cc1f39] focus:ring-[#cc1f39]/20 rounded-xl h-11 text-sm font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-white/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                className="bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:border-[#cc1f39] focus:ring-[#cc1f39]/20 rounded-xl h-11 text-sm font-medium"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-sm font-black text-white bg-gradient-to-r from-[#8d1231] to-[#cc1f39] hover:from-[#a01538] hover:to-[#e0243f] shadow-lg shadow-[#8d1231]/30 hover:shadow-xl hover:shadow-[#8d1231]/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              Akun demo: username <span className="text-white/80 font-mono font-bold">admin</span> • password <span className="text-white/80 font-mono font-bold">admin123</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
