import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SessionsList, SessionRow } from '@/components/dashboard/SessionsList';
import { getSessions, getWritingPackages } from '@/data/domains/writing';

export const dynamic = 'force-dynamic';

/**
 * جلسات الطالب — نفس الفجوة اللي كانت عند المدرب بالظبط.
 */
export default async function Page() {
  const [sessions, packages] = await Promise.all([getSessions(), getWritingPackages()]);
  const packageById = new Map(packages.map((p) => [p.id, p.name]));

  const rows: SessionRow[] = sessions.map((session) => ({
    id: session.id,
    href: `/dashboard/student/sessions/${session.id}`,
    title: `الجلسة ${session.sessionNumber}`,
    subtitle: packageById.get(session.packageId),
    scheduledAt: session.scheduledAt,
    status: session.status,
    meetingUrl: session.meetingUrl,
  }));

  const upcoming = rows.filter((r) => new Date(r.scheduledAt).getTime() >= Date.now());
  const past = rows
    .filter((r) => new Date(r.scheduledAt).getTime() < Date.now())
    .reverse();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title="جلساتي" />

      <h2 className="mb-4 font-black text-slate-800">القادمة ({upcoming.length})</h2>
      <SessionsList sessions={upcoming} />

      {past.length > 0 && (
        <>
          <h2 className="mt-10 mb-4 font-black text-slate-800">اللي عدّت ({past.length})</h2>
          <SessionsList sessions={past} />
        </>
      )}
    </div>
  );
}
