'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { loansApi, booksApi, membersApi, getErrorMessage, getErrorDetails } from '@/lib/api';
import type { Book, Member } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';

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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setMemberId('');
      setBookId('');
      setError('');
      setViolations([]);
      fetchData();
    }
    }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
      toast.success('Peminjaman berhasil dibuat');
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pinjam Buku</DialogTitle>
          <DialogDescription>Pilih anggota dan buku untuk peminjaman baru.</DialogDescription>
        </DialogHeader>

        {fetchLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}

            {violations.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-1">
                {violations.map((v, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{v}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Anggota</Label>
              <Select value={memberId} onValueChange={(val) => setMemberId(val || '')}>
                <SelectTrigger><SelectValue placeholder="Pilih anggota" /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name} ({m.memberNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Buku</Label>
              <Select value={bookId} onValueChange={(val) => setBookId(val || '')}>
                <SelectTrigger><SelectValue placeholder="Pilih buku" /></SelectTrigger>
                <SelectContent>
                  {books.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.title} (stok: {b.availableCopies})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</> : 'Pinjam Buku'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
