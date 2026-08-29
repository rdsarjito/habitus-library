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
import { Loader2 } from 'lucide-react';

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: Book | null;           // null = create, Book = edit
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Ubah informasi buku di bawah ini.' : 'Isi informasi buku yang akan ditambahkan.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Judul Buku</Label>
              <Input id="title" value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Masukkan judul buku" />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <Label htmlFor="author">Penulis</Label>
              <Input id="author" value={form.author} onChange={(e) => handleChange('author', e.target.value)} placeholder="Nama penulis" />
              {errors.author && <p className="text-xs text-red-500">{errors.author}</p>}
            </div>

            {/* ISBN */}
            <div className="space-y-1.5">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" value={form.isbn} onChange={(e) => handleChange('isbn', e.target.value)} placeholder="10 atau 13 digit" />
              {errors.isbn && <p className="text-xs text-red-500">{errors.isbn}</p>}
            </div>

            {/* Publisher */}
            <div className="space-y-1.5">
              <Label htmlFor="publisher">Penerbit</Label>
              <Input id="publisher" value={form.publisher} onChange={(e) => handleChange('publisher', e.target.value)} placeholder="Nama penerbit" />
              {errors.publisher && <p className="text-xs text-red-500">{errors.publisher}</p>}
            </div>

            {/* Year Published */}
            <div className="space-y-1.5">
              <Label htmlFor="yearPublished">Tahun Terbit</Label>
              <Input id="yearPublished" type="number" value={form.yearPublished} onChange={(e) => handleChange('yearPublished', parseInt(e.target.value) || 0)} />
              {errors.yearPublished && <p className="text-xs text-red-500">{errors.yearPublished}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" value={form.category} onChange={(e) => handleChange('category', e.target.value)} placeholder="Kategori buku" />
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>

            {/* Total Copies */}
            <div className="space-y-1.5">
              <Label htmlFor="totalCopies">Jumlah Eksemplar</Label>
              <Input id="totalCopies" type="number" min={1} value={form.totalCopies} onChange={(e) => handleChange('totalCopies', parseInt(e.target.value) || 1)} />
              {errors.totalCopies && <p className="text-xs text-red-500">{errors.totalCopies}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : isEdit ? 'Simpan Perubahan' : 'Tambah Buku'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
