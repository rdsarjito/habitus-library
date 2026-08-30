'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { membersApi, getErrorMessage, getErrorDetails } from '@/lib/api';
import type { Member, MemberFormData } from '@/types/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Users } from 'lucide-react';

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member | null;
  onSuccess: () => void;
}

const emptyForm: MemberFormData = {
  memberNumber: '',
  name: '',
  email: '',
  phone: '',
  status: 'ACTIVE',
};

export function MemberFormDialog({ open, onOpenChange, member, onSuccess }: MemberFormDialogProps) {
  const isEdit = !!member;
  const [form, setForm] = useState<MemberFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (member) {
        setForm({
          memberNumber: member.memberNumber,
          name: member.name,
          email: member.email,
          phone: member.phone,
          status: member.status,
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  }, [open, member]);

  const handleChange = (field: keyof MemberFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (isEdit) {
        await membersApi.update(member!.id, form);
        toast.success('Anggota berhasil diperbarui');
      } else {
        await membersApi.create(form);
        toast.success('Anggota berhasil ditambahkan');
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
            <Users className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-black text-slate-900">
              {isEdit ? 'Edit Data Anggota' : 'Pendaftaran Anggota Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isEdit ? 'Perbarui data identitas anggota perpustakaan.' : 'Isi identitas lengkap anggota baru yang akan terdaftar.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="memberNumber" className="text-xs font-bold text-slate-700">Nomor Anggota</Label>
              <Input
                id="memberNumber"
                value={form.memberNumber}
                onChange={(e) => handleChange('memberNumber', e.target.value)}
                placeholder="MBR-2026-XXX"
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm font-mono"
              />
              {errors.memberNumber && <p className="text-xs font-semibold text-red-500">{errors.memberNumber}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-slate-700">Nama Lengkap</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Masukkan nama"
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@contoh.com"
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.email && <p className="text-xs font-semibold text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-slate-700">No. Telepon</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-sm"
              />
              {errors.phone && <p className="text-xs font-semibold text-red-500">{errors.phone}</p>}
            </div>

            {isEdit && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700">Status Keanggotaan</Label>
                <Select value={form.status} onValueChange={(val) => handleChange('status', val || 'ACTIVE')}>
                  <SelectTrigger className="rounded-xl border-slate-200 focus:border-[#8d1231] focus:ring-[#8d1231]/10 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="ACTIVE" className="text-xs font-bold text-emerald-700">
                      Aktif (Dapat Meminjam)
                    </SelectItem>
                    <SelectItem value="INACTIVE" className="text-xs font-bold text-slate-500">
                      Nonaktif (Dibekukan)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
                'Tambah Anggota'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
