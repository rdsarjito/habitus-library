'use client'

import Image from 'next/image';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  Library,
  RotateCcw,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/books', label: 'Buku', icon: BookOpen },
  { href: '/dashboard/members', label: 'Anggota', icon: Users },
  { href: '/dashboard/loans', label: 'Peminjaman', icon: ArrowLeftRight },
  { href: '/dashboard/returns', label: 'Pengembalian', icon: RotateCcw },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden p-1">
          <Image src="/logo-transparent.png" alt="Habitus Library" width={28} height={28} className="object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-black text-white tracking-tight">Perpustakaan</h1>
          <p className="text-[11px] text-white/50">Sistem Manajemen</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold transition-all duration-300 relative group',
                isActive
                  ? 'bg-white text-[#8d1231] shadow-lg shadow-black/10'
                  : 'text-white hover:bg-white/10'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0',
                  isActive ? 'bg-white' : 'bg-white/5 group-hover:bg-white/20'
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4',
                    isActive ? 'text-[#8d1231]' : 'text-white'
                  )}
                />
              </div>
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-4">
        <p className="text-center text-[11px] text-white/30">
          v1.0.0 — Habitus Library
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col bg-[#8d1231] lg:flex shadow-2xl">
        {content}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-60 flex-col bg-[#8d1231] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {content}
      </aside>
    </>
  );
}
