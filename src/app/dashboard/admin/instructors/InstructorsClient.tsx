'use client';
import React, { useState } from 'react';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { Instructor } from '@/types';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export function InstructorsClient({ initialInstructors }: { initialInstructors: Instructor[] }) {
  const [statusFilter, setStatusFilter] = useState('');

  // We don't have actual status on instructor type yet, let's mock it based on id parity for demo
  const mockStatus = (id: string) => {
    if (id.includes('2')) return 'suspended';
    if (id.includes('3')) return 'pending';
    return 'active';
  };

  const filtered = initialInstructors.filter(inst => {
    const status = mockStatus(inst.id);
    return statusFilter ? status === statusFilter : true;
  });

  const formatted = filtered.map(inst => {
    const status = mockStatus(inst.id);
    let statusDisplay = <StatusBadge type="success" label="نشط" />;
    if (status === 'suspended') statusDisplay = <StatusBadge type="danger" label="معلّق" />;
    if (status === 'pending') statusDisplay = <StatusBadge type="warning" label="قيد المراجعة" />;

    return {
      ...inst,
      nameDisplay: (
        <Link href={`/dashboard/admin/instructors/${inst.id}`} className="font-bold text-blue-600 hover:underline">
          {inst.displayName}
        </Link>
      ),
      statusDisplay,
      specialtiesDisplay: inst.specialties.join('، '),
      rating: '5.0'
    };
  });

  const columns = [
    { header: 'الاسم', accessorKey: 'nameDisplay' },
    { header: 'التخصص', accessorKey: 'specialtiesDisplay' },
    { header: 'التقييم', accessorKey: 'rating' },
    { header: 'الحالة', accessorKey: 'statusDisplay' }
  ];

  return (
    <div>
      <div className="mb-6 flex">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="pending">قيد المراجعة</option>
          <option value="suspended">معلّق</option>
        </select>
      </div>
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
