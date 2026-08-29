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
import { Loader2 } from 'lucide-react';

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Anggota' : 'Tambah Anggota Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Ubah informasi anggota di bawah ini.' : 'Isi data anggota yang akan didaftarkan.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="memberNumber">Nomor Anggota</Label>
              <Input id="memberNumber" value={form.memberNumber} onChange={(e) => handleChange('memberNumber', e.target.value)} placeholder="MBR-2026-XXX" />
              {errors.memberNumber && <p className="text-xs text-red-500">{errors.memberNumber}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Masukkan nama" />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="email@contoh.com" />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input id="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="08xxxxxxxxxx" />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>

            {isEdit && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(val) => handleChange('status', val || 'ACTIVE')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                    <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : isEdit ? 'Simpan Perubahan' : 'Tambah Anggota'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
