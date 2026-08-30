'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { membersApi, getErrorMessage } from '@/lib/api';
import type { Member, MemberQuery, PaginationMeta } from '@/types/api';
import { MemberFormDialog } from './member-form-dialog';
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
  Users,
  ChevronLeft,
  ChevronRight,
  UserX,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState<MemberQuery>({
    page: 1,
    perPage: 10,
    sort: 'createdAt',
    order: 'desc',
  });
  const [searchValue, setSearchValue] = useState('');

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await membersApi.getAll(query);
      setMembers(res.data || []);
      setMeta(res.meta || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearchChange = (search: string) => {
    setSearchValue(search);
    setQuery((prev) => ({ ...prev, search: search || undefined, page: 1 }));
  };

  const handleStatusChange = (status: string) => {
    setQuery((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : (status as 'ACTIVE' | 'INACTIVE'),
      page: 1,
    }));
  };

  const handleReset = () => {
    setSearchValue('');
    setQuery({ page: 1, perPage: 10, sort: 'createdAt', order: 'desc' });
  };

  const handleEdit = (member: Member) => {
    setEditMember(member);
    setFormOpen(true);
  };

  const handleDelete = (member: Member) => {
    setDeleteMember(member);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteMember) return;
    try {
      await membersApi.delete(deleteMember.id);
      toast.success(`Anggota "${deleteMember.name}" berhasil dihapus`);
      setDeleteOpen(false);
      setDeleteMember(null);
      fetchMembers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        modulePath="Keanggotaan"
        title="Daftar Anggota"
        subtitle="Kelola data identitas anggota perpustakaan dan izin peminjaman"
        icon={Users}
        actionLabel="Tambah Anggota"
        actionIcon={<Plus className="w-4 h-4" />}
        onActionClick={() => {
          setEditMember(null);
          setFormOpen(true);
        }}
      />

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari nama, email, atau nomor anggota..."
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onReset={handleReset}
        isLoading={loading}
      >
        <div className="w-full sm:w-56">
          <Select
            value={query.status || 'all'}
            onValueChange={(val) => handleStatusChange(val || "all")}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200/80 text-xs font-bold text-slate-700">
              <SelectValue placeholder="Semua Status">
                {(value: string | null) => {
                  const labels: Record<string, string> = {
                    all: "Semua Status",
                    ACTIVE: "Aktif",
                    INACTIVE: "Nonaktif",
                  };
                  return labels[value || "all"] || "Semua Status";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="all" className="text-xs font-semibold">Semua Status</SelectItem>
              <SelectItem value="ACTIVE" className="text-xs font-semibold text-emerald-700">Aktif</SelectItem>
              <SelectItem value="INACTIVE" className="text-xs font-semibold text-slate-500">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={`${query.sort}-${query.order}`}
            onValueChange={(val) => {
              if (!val) return;
              const [sort, order] = val.split('-') as [MemberQuery['sort'], MemberQuery['order']];
              setQuery((prev) => ({ ...prev, sort, order, page: 1 }));
            }}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-white border-slate-200/80 text-xs font-bold text-slate-700">
              <SelectValue placeholder="Urutan">
                {(value: string | null) => {
                  const labels: Record<string, string> = {
                    "createdAt-desc": "Terbaru Terdaftar",
                    "name-asc": "Nama (A-Z)",
                    "name-desc": "Nama (Z-A)",
                    "memberNumber-asc": "No. Anggota (Naik)",
                  };
                  return labels[value || "createdAt-desc"] || "Urutan";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="createdAt-desc" className="text-xs font-semibold">Terbaru Terdaftar</SelectItem>
              <SelectItem value="name-asc" className="text-xs font-semibold">Nama (A-Z)</SelectItem>
              <SelectItem value="name-desc" className="text-xs font-semibold">Nama (Z-A)</SelectItem>
              <SelectItem value="memberNumber-asc" className="text-xs font-semibold">No. Anggota (Naik)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      {/* Table Card */}
      <div className="kpi-table-container">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#8d1231]" />
            <p className="text-xs font-bold text-slate-400">Memuat data anggota...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#8d1231] flex items-center justify-center mb-3">
              <UserX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-800">Tidak ada anggota ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Coba sesuaikan kata kunci pencarian atau filter status di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table>
              <thead>
                <tr>
                  <th>No. Anggota</th>
                  <th>Nama Lengkap</th>
                  <th>Email</th>
                  <th>No. Telepon</th>
                  <th>Status</th>
                  <th>Terdaftar</th>
                  <th className="text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isActive = member.status === 'ACTIVE';
                  return (
                    <tr key={member.id}>
                      <td className="font-mono font-bold text-xs text-slate-800">
                        {member.memberNumber}
                      </td>
                      <td className="font-black text-slate-900 min-w-[180px]">
                        {member.name}
                      </td>
                      <td className="font-medium text-slate-600 min-w-[160px]">
                        {member.email}
                      </td>
                      <td className="font-medium text-slate-600 font-mono text-xs">
                        {member.phone}
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </span>
                      </td>
                      <td className="text-xs font-semibold text-slate-400">
                        {new Date(member.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="text-left whitespace-nowrap">
                        <div className="flex items-center justify-start gap-1.5">
                          <button
                            onClick={() => handleEdit(member)}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#8d1231] hover:bg-red-50 transition-all cursor-pointer"
                            title="Edit Anggota"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Hapus Anggota"
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
              Menampilkan <span className="font-black text-slate-800">{members.length}</span> dari{' '}
              <span className="font-black text-slate-800">{meta.total}</span> anggota
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
      <MemberFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editMember}
        onSuccess={fetchMembers}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Anggota"
        description={`Apakah Anda yakin ingin menghapus anggota "${deleteMember?.name}"? Data riwayat pinjaman akan mencegah penghapusan jika ada.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
