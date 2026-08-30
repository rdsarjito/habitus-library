'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { loansApi, booksApi, membersApi, getErrorMessage, getErrorDetails } from '@/lib/api';
import type { Book, Member } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle, ArrowLeftRight, ShieldAlert } from 'lucide-react';

interface LoanCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LoanCreateDialog({ open, onOpenChange, onSuccess }: LoanCreateDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [memberId, setMemberId] = useState('');
  const [bookId, setBookId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState<string[]>([]);

  const fetchData = async () => {
    setFetchLoading(true);
    try {
      const [membersRes, booksRes] = await Promise.all([
        membersApi.getAll({ perPage: 100, status: 'ACTIVE', sort: 'name', order: 'asc' }),
        booksApi.getAll({ perPage: 100, sort: 'title', order: 'asc' }),
      ]);
      setMembers((membersRes.data || []).filter((m) => m.status === 'ACTIVE'));
      setBooks((booksRes.data || []).filter((b) => b.availableCopies > 0));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setMemberId('');
      setBookId('');
      setError('');
      setViolations([]);
      fetchData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !bookId) {
      setError('Pilih anggota dan buku terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');
    setViolations([]);

    try {
      await loansApi.create({ memberId, bookId });
      toast.success('Peminjaman buku berhasil dicatat');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const details = getErrorDetails(err);
      if (details.length > 0 && details[0].code !== 'UNKNOWN') {
        setViolations(details.map((d) => d.message));
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-slate-100 p-6 shadow-2xl">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#8d1231] flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-black text-slate-900">
              Form Peminjaman Buku
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              Pilih anggota dan judul buku untuk membuat transaksi pinjaman baru.
            </DialogDescription>
          </div>
        </DialogHeader>

        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-[#8d1231]" />
            <p className="text-xs font-bold text-slate-400">Memuat data pilihan...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200/80 p-3 text-xs font-bold text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {violations.length > 0 && (
              <div className="rounded-xl bg-red-50 border border-red-200/80 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#8d1231]">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Validasi Aturan Bisnis Gagal:</span>
                </div>
                <div className="space-y-1.5 pl-6 list-disc">
                  {violations.map((v, i) => (
                    <p key={i} className="text-xs font-semibold text-red-700">
                      • {v}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Pilih Anggota</Label>
              <Select value={memberId} onValueChange={(val) => setMemberId(val || '')}>
                <SelectTrigger className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-xs font-bold">
                  <SelectValue placeholder="-- Pilih Anggota Peminjam --" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-56">
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs font-semibold">
                      {m.name} ({m.memberNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Pilih Judul Buku</Label>
              <Select value={bookId} onValueChange={(val) => setBookId(val || '')}>
                <SelectTrigger className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-xs font-bold">
                  <SelectValue placeholder="-- Pilih Buku yang Tersedia --" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl max-h-56">
                  {books.map((b) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs font-semibold">
                      {b.title} (Stok: {b.availableCopies})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Informasi Ketentuan:</p>
              <p>• Masa pinjam: <strong>14 hari</strong> otomatis sejak tanggal dibuat.</p>
              <p>• Maksimal pinjam aktif per anggota: <strong>3 buku</strong>.</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="rounded-xl h-11 px-5 font-bold text-xs border-slate-200 hover:bg-slate-50"
              >
                Batal
              </Button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#8d1231] to-[#cc1f39] hover:from-[#a01538] hover:to-[#e0243f] shadow-lg shadow-[#8d1231]/25 hover:shadow-xl hover:shadow-[#8d1231]/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses Transaksi...</span>
                  </>
                ) : (
                  'Konfirmasi Peminjaman'
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
