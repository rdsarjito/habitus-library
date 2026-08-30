'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, RefreshCcw, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  debounceMs?: number;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = 'Cari...',
  searchValue,
  onSearchChange,
  onReset,
  isLoading = false,
  children,
  debounceMs = 400,
  className,
}: FilterBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [localValue, setLocalValue] = useState(searchValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(searchValue);
  }, [searchValue]);

  const handleChange = useCallback(
    (value: string) => {
      setLocalValue(value);

      if (debounceMs <= 0) {
        onSearchChange(value);
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, debounceMs);
    },
    [debounceMs, onSearchChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        'mb-6 bg-white border rounded-2xl shadow-sm transition-all duration-300',
        isFocused
          ? 'border-[#8d1231]/40 shadow-lg shadow-[#8d1231]/5 ring-2 ring-[#8d1231]/10'
          : 'border-slate-200/80 hover:border-slate-300',
        className
      )}
    >
      {/* Top row: Search input */}
      <div
        className={cn(
          'flex items-center px-4 sm:px-5 py-2.5 rounded-t-2xl transition-all duration-300',
          children && 'border-b border-slate-100',
          isFocused && 'bg-red-50/20'
        )}
      >
        <div
          className={cn(
            'p-2 rounded-xl mr-3 transition-all duration-300 cursor-pointer shrink-0',
            isFocused
              ? 'bg-[#8d1231] shadow-md shadow-[#8d1231]/30 scale-105'
              : 'bg-red-50 text-[#8d1231]'
          )}
          onClick={() => inputRef.current?.focus()}
        >
          <Search
            className={cn(
              'w-4 h-4 transition-colors duration-300',
              isFocused ? 'text-white' : 'text-[#8d1231]'
            )}
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={searchPlaceholder}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 px-1 py-2 bg-transparent outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
        />
        {localValue && (
          <button
            onClick={() => handleChange('')}
            className="text-xs font-bold text-slate-400 hover:text-[#8d1231] transition-all px-2.5 py-1 rounded-lg hover:bg-red-50"
          >
            Hapus
          </button>
        )}
        {children && (
          <button
            onClick={() => setFiltersVisible(!filtersVisible)}
            className={cn(
              'ml-2 p-2 rounded-xl transition-all duration-300 cursor-pointer',
              filtersVisible
                ? 'bg-red-50 text-[#8d1231]'
                : 'bg-slate-100 text-slate-400 -rotate-90'
            )}
            title="Filter Opsi"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bottom row: Filter selectors + Reset button */}
      {children && filtersVisible && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3.5 bg-slate-50/50 rounded-b-2xl animate-in fade-in duration-200">
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-3">
            {children}
          </div>

          <button
            onClick={onReset}
            title="Reset Filter"
            className="flex items-center justify-center gap-2 h-10 px-4 bg-white border border-slate-200/80 text-slate-600 hover:text-[#8d1231] hover:border-[#8d1231]/30 hover:bg-red-50/50 rounded-xl transition-all duration-200 text-xs font-bold shadow-xs active:scale-95 cursor-pointer shrink-0"
          >
            <RefreshCcw
              className={cn(
                'w-3.5 h-3.5 transition-transform',
                isLoading && 'animate-spin'
              )}
            />
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  );
}
