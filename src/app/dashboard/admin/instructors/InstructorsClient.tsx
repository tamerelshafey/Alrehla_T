'use client';

import React, { useState } from 'react';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { Instructor } from '@/types';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

export function InstructorsClient({ initialInstructors }: { initialInstructors: Instructor[] }) {
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = initialInstructors.filter(inst => {
    return statusFilter ? inst.status === statusFilter : true;
  });

  const formatted = filtered.map(inst => {
    let statusDisplay = <StatusBadge type="success" label="نشط" />;
    if (inst.status === 'suspended') statusDisplay = <StatusBadge type="danger" label="موقوف" />;
    if (inst.status === 'pending_approval') statusDisplay = <StatusBadge type="warning" label="بانتظار الاعتماد" />;
    if (inst.status === 'pending_training') statusDisplay = <StatusBadge type="neutral" label="قيد التدريب" />;

    return {
      ...inst,
      nameDisplay: (
        <Link href={`/dashboard/admin/instructors/${inst.id}`} className="font-bold text-blue-600 hover:underline">
          {inst.displayName}
        </Link>
      ),
      statusDisplay,
      workModelDisplay: inst.workModel === 'monthly' ? 'راتب شهري' : 'بالجلسة',
      specialtiesDisplay: inst.specialties.join('، '),
      rating: '5.0'
    };
  });

  const columns = [
    { header: 'الاسم', accessorKey: 'nameDisplay' },
    { header: 'التخصص', accessorKey: 'specialtiesDisplay' },
    { header: 'نظام العمل', accessorKey: 'workModelDisplay' },
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
          <option value="pending_approval">بانتظار الاعتماد</option>
          <option value="pending_training">قيد التدريب</option>
          <option value="suspended">موقوف</option>
        </select>
      </div>
      <SimpleDataTable columns={columns} data={formatted} />
    </div>
  );
}
