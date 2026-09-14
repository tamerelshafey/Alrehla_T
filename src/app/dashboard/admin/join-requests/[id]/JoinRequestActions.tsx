'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { setJoinRequestStatus } from '@/actions/join-requests';

/**
 * Accepting or rejecting an application.
 *
 * Both buttons used to have no handler at all — the application stayed
 * "قيد المراجعة" however many times an admin clicked.
 */
export function JoinRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const decide = async (status: 'approved' | 'rejected') => {
    setBusy(true);
    setError('');
    try {
      await setJoinRequestStatus(requestId, status);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر تحديث الطلب');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => decide('approved')}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          <CheckCircle className="h-5 w-5" />
          قبول الطلب
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => decide('rejected')}
          className="flex items-center gap-2 rounded-xl bg-rose-50 px-6 py-3 font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
        >
          <XCircle className="h-5 w-5" />
          رفض الطلب
        </button>
      </div>
    </div>
  );
}
