'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { membersApi, getErrorMessage } from '@/lib/api';
import type { Member, MemberQuery, PaginationMeta } from '@/types/api';
import { MemberFormDialog } from './member-form-dialog';
import { DeleteDialog } from '@/components/shared/delete-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Search, Pencil, Trash2, Loader2, Users, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState<MemberQuery>({ page: 1, perPage: 10, sort: 'createdAt', order: 'desc' });
  const [searchInput, setSearchInput] = useState('');

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

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  const handleStatusFilter = (status: string | null) => {
    setQuery((prev) => ({
      ...prev,
      status: (!status || status === 'all') ? undefined : status as 'ACTIVE' | 'INACTIVE',
      page: 1,
    }));
  };

  const handleDelete = async () => {
    if (!deleteMember) return;
    try {
      await membersApi.delete(deleteMember.id);
      toast.success(`Anggota "${deleteMember.name}" berhasil dihapus`);
      fetchMembers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Anggota</h1>
          <p className="mt-1 text-slate-500">Kelola data anggota perpustakaan</p>
        </div>
        <Button onClick={() => { setEditMember(null); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Anggota
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Cari nama, nomor, atau email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10" />
              </div>
              <Button type="submit" variant="outline">Cari</Button>
            </form>
            <Select value={query.status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Semua" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="INACTIVE">Nonaktif</SelectItem>
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
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">Tidak ada anggota ditemukan</p>
              <p className="text-sm">Coba ubah filter atau tambahkan anggota baru</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Anggota</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-mono text-xs text-slate-500">{member.memberNumber}</TableCell>
                    <TableCell className="font-medium text-slate-900">{member.name}</TableCell>
                    <TableCell className="text-slate-600">{member.email}</TableCell>
                    <TableCell className="text-slate-600">{member.phone}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={member.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500'}>
                        {member.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditMember(member); setFormOpen(true); }} className="h-8 w-8">
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeleteMember(member); setDeleteOpen(true); }} className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-500">Menampilkan {members.length} dari {meta.total} anggota</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) - 1 }))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600">{meta.page} / {meta.totalPages}</span>
                <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) + 1 }))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <MemberFormDialog open={formOpen} onOpenChange={setFormOpen} member={editMember} onSuccess={fetchMembers} />
      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Hapus Anggota"
        description={`Apakah Anda yakin ingin menghapus anggota "${deleteMember?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete} />
    </div>
  );
}
