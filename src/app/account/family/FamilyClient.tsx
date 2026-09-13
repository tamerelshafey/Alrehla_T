'use client';
import React, { useState, useTransition } from 'react';
import { ChildProfile } from '@/types';
import { createFamilyMember, updateFamilyMember, deleteFamilyMember } from '@/app/actions/family';
import { Button } from '@/components/ui/Button';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { Trash2, Edit2, Plus, X } from 'lucide-react';
import { calculateAge } from '@/lib/utils';

export function FamilyClient({ initialMembers }: { initialMembers: ChildProfile[] }) {
  const [members, setMembers] = useState<ChildProfile[]>(initialMembers);
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ fullName: '', birthDate: '' });

  const resetForm = () => {
    setFormData({ fullName: '', birthDate: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (child: ChildProfile) => {
    setFormData({ fullName: child.fullName, birthDate: child.birthDate || '' });
    setEditingId(child.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    startTransition(async () => {
      const success = await deleteFamilyMember(id);
      if (success) {
        setMembers(prev => prev.filter(m => m.id !== id));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.birthDate) return;

    startTransition(async () => {
      if (editingId) {
        const success = await updateFamilyMember(editingId, formData.fullName, formData.birthDate);
        if (success) {
          setMembers(prev => prev.map(m => m.id === editingId ? { ...m, fullName: formData.fullName, birthDate: formData.birthDate } : m));
          resetForm();
        }
      } else {
        const newChild = await createFamilyMember(formData.fullName, formData.birthDate);
        if (newChild) {
          setMembers(prev => [...prev, newChild]);
          resetForm();
        }
      }
    });
  };

  const columns = [
    { header: 'الاسم', accessorKey: 'fullName' },
    { 
      header: 'العمر (سنوات)', 
      accessorKey: 'age',
      cell: (child: ChildProfile) => {
        const age = calculateAge(child.birthDate);
        return age !== null ? age.toString() : '-';
      }
    },
    { 
      header: 'الإجراءات', 
      accessorKey: 'actions',
      cell: (child: ChildProfile) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(child)} className="text-slate-400 hover:text-amber-500"><Edit2 className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(child.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">أفراد العائلة</h2>
        <Button onClick={() => setShowForm(true)} accentColor="amber" className="gap-2">
          <Plus className="h-4 w-4" /> إضافة فرد
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-slate-700 mb-2">اسم الطفل</label>
            <input 
              type="text" 
              required 
              className="w-full rounded-xl border-slate-200" 
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الميلاد</label>
            <input 
              type="date" 
              required 
              className="w-full rounded-xl border-slate-200" 
              value={formData.birthDate}
              onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="submit" disabled={isPending} accentColor="emerald" className="flex-1">حفظ</Button>
            <Button type="button" onClick={resetForm} variant="secondary" className="!bg-slate-200">إلغاء</Button>
          </div>
        </form>
      )}

      {members.length > 0 ? (
        <SimpleDataTable columns={columns} data={members as any} />
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500">
          لا يوجد أفراد عائلة مضافين بعد
        </div>
      )}
    </div>
  );
}
