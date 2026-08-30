'use client';

import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  modulePath?: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
  className?: string;
  hideBreadcrumbs?: boolean;
  extraAction?: React.ReactNode;
}

export function PageHeader({
  modulePath = 'Dashboard',
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  actionIcon,
  onActionClick,
  className,
  hideBreadcrumbs = false,
  extraAction,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4 mb-6', className)}>
      {/* Breadcrumbs */}
      {!hideBreadcrumbs && (
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#8d1231] animate-in slide-in-from-left duration-300">
          <span className="bg-red-50 text-[#8d1231] px-2.5 py-1 rounded-xl border border-red-100/60 shadow-xs">
            {modulePath}
          </span>
          <ChevronRight className="w-3 h-3 text-red-300" />
          <span className="text-slate-400 font-bold">{title}</span>
        </div>
      )}

      {/* Main Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-14 h-14 bg-white rounded-2xl shadow-lg shadow-slate-200/60 flex items-center justify-center border border-slate-100 transition-all hover:scale-105 shrink-0">
              <Icon className="w-6 h-6 text-[#8d1231] drop-shadow-xs" />
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-500 font-semibold text-xs tracking-wide mt-1 flex items-center gap-2">
                <span className="text-[#8d1231]">•</span> {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {extraAction}
          {actionLabel && onActionClick && (
            <button
              onClick={onActionClick}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-[#8d1231] to-[#cc1f39] hover:from-[#a01538] hover:to-[#e0243f] shadow-lg shadow-[#8d1231]/25 hover:shadow-xl hover:shadow-[#8d1231]/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              {actionIcon}
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
