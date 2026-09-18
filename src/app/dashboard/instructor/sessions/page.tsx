import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SessionsList, SessionRow } from '@/components/dashboard/SessionsList';
import { getSessions, getWritingPackages } from '@/data/domains/writing';
import { getParticipantName } from '@/data/domains/account';

export const dynamic = 'force-dynamic';

/**
 * جلسات المدرب.
 *
 * الشاشة دي **مكانتش موجودة**: صفحة الجلسة الواحدة موجودة، والطريق
 * الوحيد ليها كان رابط في إشعار. المدرب مكانش عنده أي مكان يشوف فيه
 * جدوله كله.
 */
export default async function Page() {
  const [sessions, packages] = await Promise.all([getSessions(), getWritingPackages()]);
  const packageById = new Map(packages.map((p) => [p.id, p.name]));

  const rows: SessionRow[] = await Promise.all(
    sessions.map(async (session) => ({
      id: session.id,
      href: `/dashboard/instructor/sessions/${session.id}`,
      // الاسم الحقيقي — الصفحة الرئيسية كانت بتعرض جزء من رقم الحساب.
      title: `جلسة ${session.sessionNumber} مع ${await getParticipantName(
        session.childId,
        session.userId
      )}`,
      subtitle: packageById.get(session.packageId),
      scheduledAt: session.scheduledAt,
      status: session.status,
      meetingUrl: session.meetingUrl,
    }))
  );

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
