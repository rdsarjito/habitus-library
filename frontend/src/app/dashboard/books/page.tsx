'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { booksApi, getErrorMessage } from '@/lib/api';
import type { Book, BookQuery, PaginationMeta } from '@/types/api';
import { BookFormDialog } from './book-form-dialog';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState<BookQuery>({ page: 1, perPage: 10, sort: 'createdAt', order: 'desc' });
  const [searchInput, setSearchInput] = useState('');

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await booksApi.getAll(query);
      setBooks(res.data || []);
      setMeta(res.meta || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await booksApi.getCategories();
      setCategories(cats);
    } catch { /* ignore */ }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  const handleCategoryFilter = (cat: string | null) => {
    setQuery((prev) => ({
      ...prev,
      category: (!cat || cat === 'all') ? undefined : cat,
      page: 1,
    }));
  };

  const handleDelete = async () => {
    if (!deleteBook) return;
    try {
      await booksApi.delete(deleteBook.id);
      toast.success(`Buku "${deleteBook.title}" berhasil dihapus`);
      fetchBooks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEdit = (book: Book) => { setEditBook(book); setFormOpen(true); };
  const openCreate = () => { setEditBook(null); setFormOpen(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Buku Test</h1>
          <p className="mt-1 text-slate-500">Kelola koleksi buku perpustakaan</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Buku
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari judul, penulis, atau ISBN..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">Cari</Button>
            </form>
            <Select value={query.category || 'all'} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <BookOpen className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">Tidak ada buku ditemukan</p>
              <p className="text-sm">Coba ubah filter atau tambahkan buku baru</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.publisher}, {book.yearPublished}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{book.author}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{book.isbn}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">{book.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-semibold ${book.availableCopies === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {book.availableCopies}
                      </span>
                      <span className="text-slate-400">/{book.totalCopies}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(book)} className="h-8 w-8">
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeleteBook(book); setDeleteOpen(true); }} className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">
                Menampilkan {books.length} dari {meta.total} buku
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600">
                  {meta.page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <BookFormDialog open={formOpen} onOpenChange={setFormOpen} book={editBook} onSuccess={fetchBooks} />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Buku"
        description={`Apakah Anda yakin ingin menghapus buku "${deleteBook?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
