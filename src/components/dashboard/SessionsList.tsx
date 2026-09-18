import React from 'react';
import Link from 'next/link';
import { Clock, Video } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { PLATFORM_TIMEZONE } from '@/lib/timezone';

/**
 * قائمة جلسات — بتتعرض للمدرب وللطالب بنفس الشكل.
 *
 * قبل كده مكانش فيه أي قائمة جلسات لا للمدرب ولا للطالب: صفحة الجلسة
 * الواحدة موجودة، والطريق الوحيد ليها كان رابط في إشعار. يعني اللي
 * مسحش إشعاراته مالوش طريقة يعرف مواعيده.
 */
export type SessionRow = {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  scheduledAt: string;
  status: string;
  meetingUrl?: string;
};

const STATUS: Record<string, { label: string; type: 'success' | 'warning' | 'neutral' }> = {
  confirmed: { label: 'مؤكدة', type: 'success' },
  pending: { label: 'بانتظار التأكيد', type: 'warning' },
  completed: { label: 'تمّت', type: 'neutral' },
  cancelled: { label: 'ملغاة', type: 'neutral' },
};

export function SessionsList({ sessions }: { sessions: SessionRow[] }) {
  if (sessions.length === 0) {
    return (
      <p className="rounded-3xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500">
        مفيش جلسات مسجّلة.
      </p>
    );
  }

  const now = Date.now();

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const date = new Date(session.scheduledAt);
        const isToday = new Date().toDateString() === date.toDateString();
        const past = date.getTime() < now;
        const badge = STATUS[session.status] ?? { label: session.status, type: 'neutral' as const };

        return (
          <div
            key={session.id}
            className={`flex flex-col justify-between gap-4 rounded-2xl border p-4 md:flex-row md:items-center ${
              isToday ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl font-bold ${
                  isToday
                    ? 'bg-amber-500 text-white'
                    : past
                      ? 'border border-slate-200 bg-slate-50 text-slate-400'
                      : 'border border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span className="text-xs">
                  {date.toLocaleDateString('ar-EG', { timeZone: PLATFORM_TIMEZONE, month: 'short' })}
                </span>
                <span className="text-lg leading-none">{date.getDate()}</span>
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-800">{session.title}</p>
                {session.subtitle && (
                  <p className="truncate text-sm font-medium text-slate-500">
                    {session.subtitle}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {date.toLocaleTimeString('ar-EG', { timeZone: PLATFORM_TIMEZONE,
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <StatusBadge type={badge.type} label={badge.label} />
                </div>
              </div>
            </div>

            <div className="flex w-full shrink-0 items-center gap-3 md:w-auto">
              {/* زرار الدخول بيظهر بس لو فيه رابط فعلي. زرار بيودّي لصفحة
                  Google Meet الرئيسية مش «دخول جلسة». */}
              {session.meetingUrl && !past && (
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold whitespace-nowrap text-white transition-colors hover:bg-slate-800 md:flex-none"
                >
                  <Video className="h-4 w-4" />
                  دخول الجلسة
                </a>
              )}
              <Link
                href={session.href}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-center text-sm font-bold whitespace-nowrap text-slate-700 transition-colors hover:bg-slate-50"
              >
                التفاصيل
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
