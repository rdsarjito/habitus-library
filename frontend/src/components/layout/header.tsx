'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Menu, User, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const displayName = user?.name || 'Petugas Perpustakaan';
  const displayEmail = user?.username ? `@${user.username}` : 'petugas@perpustakaan.id';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName
  )}&background=8d1231&color=fff&bold=true`;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
      {/* Left — hamburger (mobile only) */}
      <button
        onClick={onMenuToggle}
        className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-[#8d1231] transition-all lg:hidden cursor-pointer"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Sistem Aktif & Terhubung</span>
      </div>

      {/* Right — User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 focus:outline-none cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-black text-slate-800 leading-none mb-1 group-hover:text-[#8d1231] transition-colors">
              {displayName}
            </p>
            <p className="text-[10px] font-bold text-slate-400 lowercase">{displayEmail}</p>
          </div>

          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden shadow-xs group-hover:border-[#8d1231]/40 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-56 rounded-2xl p-2 bg-white border border-slate-100 shadow-2xl z-[999]"
        >
          <div className="p-2 font-normal">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-[#8d1231] text-[10px] font-extrabold">
                <ShieldCheck className="w-3 h-3" />
                Staff Petugas
              </span>
            </div>
            <p className="text-sm font-black text-slate-900 leading-tight">{displayName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{displayEmail}</p>
          </div>
          <DropdownMenuSeparator className="my-1 bg-slate-100" />
          <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#8d1231] rounded-xl transition-colors cursor-pointer">
            <User className="h-4 w-4 text-slate-400" />
            <span>Informasi Akun</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-slate-100" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            <span>Keluar Aplikasi</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
