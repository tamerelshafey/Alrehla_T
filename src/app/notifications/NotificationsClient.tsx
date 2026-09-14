'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { NotificationItem } from '@/types';
import { markNotificationRead, markAllNotificationsRead } from '@/actions/notifications';

export function NotificationsClient({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const unread = items.filter((i) => !i.isRead).length;

  const markAll = async () => {
    setBusy(true);
    await markAllNotificationsRead();
    router.refresh();
    setBusy(false);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center">
        <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="font-bold text-slate-500">لا توجد إشعارات.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unread > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={markAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> تعليم الكل كمقروء
          </button>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <h3
                  className={`font-black ${item.isRead ? 'text-slate-600' : 'text-slate-900'}`}
                >
                  {item.title}
                </h3>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">
                    {formatDate(item.createdAt)}
                  </span>
                  {!item.isRead && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                </div>
              </div>
              {item.message && (
                <p className="mt-1 text-sm leading-relaxed font-medium text-slate-500">
                  {item.message}
                </p>
              )}
              {item.link && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                  فتح <ArrowLeft className="h-3 w-3" />
                </span>
              )}
            </>
          );

          const className = `block rounded-2xl border p-5 transition-colors ${
            item.isRead
              ? 'border-slate-200 bg-white'
              : 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
          }`;

          return item.link ? (
            <Link
              key={item.id}
              href={item.link}
              onClick={() => {
                if (!item.isRead) void markNotificationRead(item.id);
              }}
              className={className}
            >
              {body}
            </Link>
          ) : (
            <div key={item.id} className={className}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
