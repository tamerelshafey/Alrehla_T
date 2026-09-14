'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, X } from 'lucide-react';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Pagination } from '@/components/dashboard/Pagination';
import { inviteUser, updateUserRole } from '@/actions/admin-users';
import { InviteLinkBox } from '@/components/dashboard/InviteLinkBox';
import type { UserProfile, UserRole } from '@/types';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

export const ROLE_LABELS: Record<string, string> = {
  visitor: 'زائر',
  student: 'عميل / طالب',
  instructor: 'مدرب',
  publisher: 'ناشر',
  general_supervisor: 'مشرف عام',
  super_admin: 'مدير نظام',
};

const ASSIGNABLE: UserRole[] = [
  'student',
  'instructor',
  'publisher',
  'general_supervisor',
  'super_admin',
];

const EMPTY_FILTERS = { search: '', role: '', guardian: '', account: '' };

export function UsersClient({
  users,
  canInvite,
  isSuperAdmin,
  currentUserId,
}: {
  users: UserProfile[];
  canInvite: boolean;
  isSuperAdmin: boolean;
  currentUserId: string;
}) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showForm, setShowForm] = useState(false);

  const set = (key: keyof typeof EMPTY_FILTERS, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !`${u.fullName} ${u.email ?? ''}`.toLowerCase().includes(q))
        return false;
      if (filters.role && u.role !== filters.role) return false;
      if (filters.guardian === 'yes' && !u.isGuardian) return false;
      if (filters.guardian === 'no' && u.isGuardian) return false;
      // «له حساب دخول» = عنده بريد مسجَّل في المصادقة.
      if (filters.account === 'with_email' && !u.email) return false;
      if (filters.account === 'no_email' && u.email) return false;
      return true;
    });
  }, [users, filters]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const formatted = pageRows.map((user) => ({
    ...user,
    fullNameDisplay: (
      <Link
        href={`/dashboard/admin/users/${user.id}`}
        className="font-bold text-blue-600 hover:underline"
      >
        {user.fullName}
      </Link>
    ),
    emailDisplay: user.email ? (
      <span dir="ltr" className="text-sm text-slate-700">
        {user.email}
      </span>
    ) : (
      <span className="text-sm text-slate-400">—</span>
    ),
    roleDisplay: (
      <RoleCell
        userId={user.id}
        role={user.role}
        editable={user.id !== currentUserId || isSuperAdmin}
        isSuperAdmin={isSuperAdmin}
      />
    ),
    guardianDisplay: user.isGuardian ? (
      <StatusBadge type="neutral" label="ولي أمر" />
    ) : (
      <span className="text-slate-400">—</span>
    ),
  }));

  const columns = [
    { header: 'الاسم', accessorKey: 'fullNameDisplay' },
    { header: 'البريد الإلكتروني', accessorKey: 'emailDisplay' },
    { header: 'الدور', accessorKey: 'roleDisplay' },
    { header: 'ولي أمر', accessorKey: 'guardianDisplay' },
  ];

  return (
    <div>
      {canInvite && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-slate-800"
          >
            {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {showForm ? 'إغلاق' : 'إضافة مستخدم'}
          </button>
        </div>
      )}

      {showForm && (
        <InviteForm isSuperAdmin={isSuperAdmin} onDone={() => setShowForm(false)} />
      )}

      <div className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="relative">
          <Search className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputClass} pr-11`}
            placeholder="ابحث بالاسم أو البريد الإلكتروني…"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">الدور</label>
            <select
              className={inputClass}
              value={filters.role}
              onChange={(e) => set('role', e.target.value)}
            >
              <option value="">كل الأدوار</option>
              {Object.entries(ROLE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">ولي أمر</label>
            <select
              className={inputClass}
              value={filters.guardian}
              onChange={(e) => set('guardian', e.target.value)}
            >
              <option value="">الكل</option>
              <option value="yes">ولي أمر</option>
              <option value="no">ليس ولي أمر</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">البريد</label>
            <select
              className={inputClass}
              value={filters.account}
              onChange={(e) => set('account', e.target.value)}
            >
              <option value="">الكل</option>
              <option value="with_email">له بريد مسجَّل</option>
              <option value="no_email">بدون بريد</option>
            </select>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setPage(1);
            }}
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            مسح الفلاتر ({activeFilterCount})
          </button>
        )}
      </div>

      <SimpleDataTable columns={columns} data={formatted} />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
      />
    </div>
  );
}

/**
 * تغيير الدور من الجدول مباشرة.
 *
 * التغيير بيتحفظ فورًا — مفيش زرار حفظ منفصل عشان ما يحصلش اللبس المعتاد:
 * «غيّرت الدور وخرجت من الصفحة والتغيير ضاع».
 */
function RoleCell({
  userId,
  role,
  editable,
  isSuperAdmin,
}: {
  userId: string;
  role: UserRole;
  editable: boolean;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState<UserRole>(role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!editable) {
    return (
      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
        {ROLE_LABELS[role] ?? role}
      </span>
    );
  }

  const change = async (next: UserRole) => {
    const previous = value;
    setValue(next);
    setBusy(true);
    setError('');
    try {
      await updateUserRole(userId, next);
      router.refresh();
    } catch (err) {
      setValue(previous); // الرجوع للقيمة القديمة: الشاشة ما تكدبش على المستخدم
      setError(err instanceof Error ? err.message : 'تعذّر تغيير الدور');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1">
      <select
        value={value}
        disabled={busy}
        onChange={(e) => change(e.target.value as UserRole)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
      >
        {ASSIGNABLE.filter(
          (r) => isSuperAdmin || (r !== 'super_admin' && r !== 'general_supervisor'),
        ).map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      {error && <p className="max-w-[12rem] text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}

function InviteForm({
  isSuperAdmin,
  onDone,
}: {
  isSuperAdmin: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    role: 'student' as UserRole,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [link, setLink] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    setLink('');
    try {
      const result = await inviteUser(form);
      setLink(result.inviteLink);
      setForm({ email: '', fullName: '', role: 'student' });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر إنشاء الدعوة');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-black text-slate-800">دعوة مستخدم جديد</h2>
      <p className="mb-6 text-sm font-medium text-slate-500">
        الحساب هيتعمل وهيظهرلك رابط تبعته للشخص (واتساب مثلًا) يحدد منه كلمة
        مروره. مفيش كلمة مرور بتمر عليك ولا بتتخزّن في أي مكان.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}
      {link && <InviteLinkBox link={link} />}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
          <input
            type="email"
            dir="ltr"
            className={`${inputClass} text-left`}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
          <input
            className={inputClass}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">الدور</label>
          <select
            className={inputClass}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          >
            {ASSIGNABLE.filter(
              (r) => isSuperAdmin || (r !== 'super_admin' && r !== 'general_supervisor'),
            ).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-amber-700">
        لإضافة <strong>مدرب</strong>، استخدم شاشة «المدربين» بدل دي — عشان يتعمل
        له ملف مدرب كامل مش مجرد حساب.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl px-6 py-3 font-bold text-slate-600 hover:text-slate-900"
        >
          إغلاق
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={busy || !form.email.trim() || !form.fullName.trim()}
          className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? 'جارٍ الإنشاء…' : 'إنشاء الدعوة'}
        </button>
      </div>
    </div>
  );
}
