'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { booksApi, getErrorMessage } from '@/lib/api';
import type { Book, BookQuery, PaginationMeta } from '@/types/api';
import { BookFormDialog } from './book-form-dialog';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Package,
} from 'lucide-react';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState<BookQuery>({
    page: 1,
    perPage: 10,
    sort: 'createdAt',
    order: 'desc',
  });
  const [searchValue, setSearchValue] = useState('');

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
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    setQuery((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setQuery((prev) => ({
      ...prev,
      category: category === 'all' ? undefined : category,
      page: 1,
    }));
  };

  const handleReset = () => {
    setSearchValue('');
    setQuery({ page: 1, perPage: 10, sort: 'createdAt', order: 'desc' });
  };

  const handleEdit = (book: Book) => {
    setEditBook(book);
    setFormOpen(true);
  };

  const handleDelete = (book: Book) => {
    setDeleteBook(book);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteBook) return;
    try {
      await booksApi.delete(deleteBook.id);
      toast.success(`Buku "${deleteBook.title}" berhasil dihapus`);
      setDeleteOpen(false);
      setDeleteBook(null);
      fetchBooks();
      fetchCategories();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        modulePath="Katalog"
        title="Daftar Buku"
        subtitle="Kelola seluruh katalog buku, ketersediaan stok, dan kategori"
        icon={BookOpen}
        actionLabel="Tambah Buku"
        actionIcon={<Plus className="w-4 h-4" />}
        onActionClick={() => {
          setEditBook(null);
          setFormOpen(true);
        }}
      />

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari judul, penulis, atau ISBN..."
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onReset={handleReset}
        isLoading={loading}
      >
        <div className="w-full sm:w-56">
          <Select
            value={query.category || 'all'}
            onValueChange={(val) => handleCategoryChange(val || "all")}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200/80 text-xs font-bold text-slate-700">
              <SelectValue placeholder="Semua Kategori">
                {(value: string | null) => {
                  const labels: Record<string, string> = { all: "Semua Kategori" };
                  categories.forEach(cat => labels[cat] = cat);
                  return labels[value || "all"] || "Semua Kategori";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all" className="text-xs font-semibold">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs font-semibold">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={`${query.sort}-${query.order}`}
            onValueChange={(val) => {
              if (!val) return;
              const [sort, order] = val.split('-') as [BookQuery['sort'], BookQuery['order']];
              setQuery((prev) => ({ ...prev, sort, order, page: 1 }));
            }}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200/80 text-xs font-bold text-slate-700">
              <SelectValue placeholder="Urutan">
                {(value: string | null) => {
                  const sortLabels: Record<string, string> = {
                    "createdAt-desc": "Terbaru Ditambahkan",
                    "title-asc": "Judul (A-Z)",
                    "title-desc": "Judul (Z-A)",
                    "yearPublished-desc": "Tahun Terbit (Baru)",
                    "availableCopies-desc": "Stok Terbanyak",
                  };
                  return sortLabels[value || "createdAt-desc"] || "Urutan";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="createdAt-desc" className="text-xs font-semibold">Terbaru Ditambahkan</SelectItem>
              <SelectItem value="title-asc" className="text-xs font-semibold">Judul (A-Z)</SelectItem>
              <SelectItem value="title-desc" className="text-xs font-semibold">Judul (Z-A)</SelectItem>
              <SelectItem value="yearPublished-desc" className="text-xs font-semibold">Tahun Terbit (Baru)</SelectItem>
              <SelectItem value="availableCopies-desc" className="text-xs font-semibold">Stok Terbanyak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      {/* Table Card */}
      <div className="kpi-table-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#8d1231]" />
            <p className="text-xs font-bold text-slate-400">Memuat data buku...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#8d1231] flex items-center justify-center mb-3">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-800">Tidak ada buku ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Coba sesuaikan kata kunci pencarian atau filter kategori di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table>
              <thead>
                <tr>
                  <th>Judul Buku</th>
                  <th>Penulis</th>
                  <th>ISBN</th>
                  <th>Kategori</th>
                  <th>Tahun</th>
                  <th>Stok</th>
                  <th className="text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const isOutOfStock = book.availableCopies === 0;
                  return (
                    <tr key={book.id}>
                      <td className="font-bold text-slate-900 min-w-[200px]">
                        <div>
                          <p className="font-black text-slate-900 line-clamp-1">{book.title}</p>
                          <p className="text-[11px] font-medium text-slate-400">{book.publisher}</p>
                        </div>
                      </td>
                      <td className="font-semibold text-slate-600 min-w-[140px]">{book.author}</td>
                      <td className="font-mono text-xs text-slate-500">{book.isbn}</td>
                      <td>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                          {book.category}
                        </span>
                      </td>
                      <td className="font-semibold text-slate-600">{book.yearPublished}</td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                            isOutOfStock
                              ? 'bg-red-50 text-[#8d1231] border border-red-200/50'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                          }`}
                        >
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                      </td>
                      <td className="text-left whitespace-nowrap">
                        <div className="flex items-center justify-start gap-1.5">
                          <button
                            onClick={() => handleEdit(book)}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#8d1231] hover:bg-red-50 transition-all cursor-pointer"
                            title="Edit Buku"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(book)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Hapus Buku"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-xs font-semibold text-slate-500">
              Menampilkan <span className="font-black text-slate-800">{books.length}</span> dari{' '}
              <span className="font-black text-slate-800">{meta.total}</span> buku
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.page <= 1 || loading}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page! - 1 }))}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#8d1231] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-slate-700 px-2">
                Halaman {meta.page} dari {meta.totalPages}
              </span>
              <button
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() => setQuery((prev) => ({ ...prev, page: prev.page! + 1 }))}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#8d1231] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <BookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        book={editBook}
        onSuccess={() => {
          fetchBooks();
          fetchCategories();
        }}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Buku"
        description={`Apakah Anda yakin ingin menghapus buku "${deleteBook?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
