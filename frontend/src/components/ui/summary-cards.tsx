'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SummaryCardItem {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color: 'rose' | 'blue' | 'emerald' | 'amber' | 'slate';
  isAlert?: boolean;
}

interface SummaryCardsProps {
  items: SummaryCardItem[];
  loading?: boolean;
  className?: string;
}

const glowStyles: Record<string, string> = {
  rose: 'after:bg-[#8d1231]/15',
  blue: 'after:bg-blue-400/20',
  emerald: 'after:bg-emerald-400/20',
  amber: 'after:bg-amber-400/20',
  slate: 'after:bg-slate-400/10',
};

const iconColorStyles: Record<string, string> = {
  rose: 'text-[#8d1231]/20 group-hover:text-[#8d1231]/30',
  blue: 'text-blue-500/20 group-hover:text-blue-500/30',
  emerald: 'text-emerald-500/20 group-hover:text-emerald-500/30',
  amber: 'text-amber-500/20 group-hover:text-amber-500/30',
  slate: 'text-slate-400/20 group-hover:text-slate-400/30',
};

const dotColorStyles: Record<string, string> = {
  rose: 'bg-[#8d1231]',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-400',
};

export function SummaryCards({ items, loading, className }: SummaryCardsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5',
        className
      )}
    >
      {items.map((card, idx) => (
        <div
          key={idx}
          className={cn(
            'relative bg-white rounded-2xl border border-slate-100 p-5 h-28 flex flex-col justify-center transition-all duration-300 overflow-hidden group hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1',
            'after:absolute after:inset-0 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500',
            glowStyles[card.color]
          )}
        >
          {/* Big Decorative Ghost Icon */}
          <card.icon
            className={cn(
              'absolute -right-3 -bottom-3 w-20 h-20 transition-all duration-500 rotate-6 group-hover:scale-110 group-hover:rotate-12',
              iconColorStyles[card.color]
            )}
          />

          <div className="relative z-10 flex flex-col gap-1">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
              {card.label}
            </p>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" />
              ) : (
                <h4
                  className={cn(
                    'text-2xl sm:text-3xl font-black tabular-nums tracking-tight transition-all duration-300',
                    card.isAlert ? 'text-[#8d1231]' : 'text-slate-800'
                  )}
                >
                  {card.value}
                </h4>
              )}
              <div
                className={cn(
                  'w-2 h-2 rounded-full mb-1 animate-pulse',
                  dotColorStyles[card.color]
                )}
              />
            </div>
            {card.subValue && (
              <p className="text-[11px] font-medium text-slate-400 line-clamp-1">
                {card.subValue}
              </p>
            )}
          </div>

          <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-[#8d1231] transition-colors" />
        </div>
      ))}
    </div>
  );
}
