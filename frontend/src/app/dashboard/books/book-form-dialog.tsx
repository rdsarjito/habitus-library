'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { booksApi, getErrorMessage, getErrorDetails } from '@/lib/api';
import type { Book, BookFormData } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, BookOpen } from 'lucide-react';

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: Book | null;
  onSuccess: () => void;
}

const emptyForm: BookFormData = {
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  yearPublished: new Date().getFullYear(),
  category: '',
  totalCopies: 1,
};

export function BookFormDialog({ open, onOpenChange, book, onSuccess }: BookFormDialogProps) {
  const isEdit = !!book;
  const [form, setForm] = useState<BookFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (book) {
        setForm({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          publisher: book.publisher,
          yearPublished: book.yearPublished,
          category: book.category,
          totalCopies: book.totalCopies,
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [open, book]);

  const handleChange = (field: keyof BookFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (isEdit) {
        await booksApi.update(book!.id, form);
        toast.success('Buku berhasil diperbarui');
      } else {
        await booksApi.create(form);
        toast.success('Buku berhasil ditambahkan');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const details = getErrorDetails(err);
      const fieldErrors: Record<string, string> = {};
      details.forEach((d) => {
        if (d.field) fieldErrors[d.field] = d.message;
      });

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-slate-100 p-6 shadow-2xl">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#8d1231] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-black text-slate-900">
              {isEdit ? 'Edit Data Buku' : 'Tambah Buku Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isEdit ? 'Perbarui rincian informasi buku ini.' : 'Masukkan informasi buku lengkap ke dalam katalog.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title" className="text-xs font-bold text-slate-700">Judul Buku</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Masukkan judul buku"
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.title && <p className="text-xs font-semibold text-red-500">{errors.title}</p>}
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <Label htmlFor="author" className="text-xs font-bold text-slate-700">Penulis</Label>
              <Input
                id="author"
                value={form.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="Nama penulis"
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.author && <p className="text-xs font-semibold text-red-500">{errors.author}</p>}
            </div>

            {/* ISBN */}
            <div className="space-y-1.5">
              <Label htmlFor="isbn" className="text-xs font-bold text-slate-700">ISBN</Label>
              <Input
                id="isbn"
                value={form.isbn}
                onChange={(e) => handleChange('isbn', e.target.value)}
                placeholder="10 atau 13 digit"
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.isbn && <p className="text-xs font-semibold text-red-500">{errors.isbn}</p>}
            </div>

            {/* Publisher */}
            <div className="space-y-1.5">
              <Label htmlFor="publisher" className="text-xs font-bold text-slate-700">Penerbit</Label>
              <Input
                id="publisher"
                value={form.publisher}
                onChange={(e) => handleChange('publisher', e.target.value)}
                placeholder="Nama penerbit"
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.publisher && <p className="text-xs font-semibold text-red-500">{errors.publisher}</p>}
            </div>

            {/* Year Published */}
            <div className="space-y-1.5">
              <Label htmlFor="yearPublished" className="text-xs font-bold text-slate-700">Tahun Terbit</Label>
              <Input
                id="yearPublished"
                type="number"
                value={form.yearPublished}
                onChange={(e) => handleChange('yearPublished', parseInt(e.target.value) || 0)}
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.yearPublished && <p className="text-xs font-semibold text-red-500">{errors.yearPublished}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-bold text-slate-700">Kategori</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Kategori buku"
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.category && <p className="text-xs font-semibold text-red-500">{errors.category}</p>}
            </div>

            {/* Total Copies */}
            <div className="space-y-1.5">
              <Label htmlFor="totalCopies" className="text-xs font-bold text-slate-700">Jumlah Eksemplar</Label>
              <Input
                id="totalCopies"
                type="number"
                min={1}
                value={form.totalCopies}
                onChange={(e) => handleChange('totalCopies', parseInt(e.target.value) || 1)}
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.totalCopies && <p className="text-xs font-semibold text-red-500">{errors.totalCopies}</p>}
            </div>
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
                  <span>Menyimpan...</span>
                </>
              ) : isEdit ? (
                'Simpan Perubahan'
              ) : (
                'Tambah Buku'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
