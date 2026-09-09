'use client';
import { formatPrice } from '@/lib/utils';

import React, { useState } from 'react';
import { InstructorPayout } from '@/types';
import { Wallet, ArrowRight, Building, CreditCard } from 'lucide-react';

interface Props {
  payouts: InstructorPayout[];
}

export function InstructorPayoutsClient({ payouts }: Props) {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  
  const pendingAmount = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('تم تقديم طلب السحب للمراجعة.');
    setShowWithdrawForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-blue-800 mb-1">الرصيد القابل للسحب</h3>
            <p className="text-3xl font-black text-blue-900">{formatPrice(pendingAmount)}</p>
          </div>
          <button 
            onClick={() => setShowWithdrawForm(true)}
            disabled={pendingAmount === 0}
            className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            طلب سحب
          </button>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-bold text-slate-500 mb-1">إجمالي الأرباح المدفوعة</h3>
          <p className="text-3xl font-black text-slate-800">
            {formatPrice(payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}
          </p>
        </div>
      </div>

      {/* Withdraw Form Modal / Section */}
      {showWithdrawForm && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">تقديم طلب سحب</h3>
          <form onSubmit={handleWithdrawSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">طريقة السحب</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('bank')}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 font-bold transition-all ${
                      withdrawMethod === 'bank' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Building className="h-5 w-5" />
                    تحويل بنكي
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('wallet')}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 font-bold transition-all ${
                      withdrawMethod === 'wallet' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    محفظة إلكترونية
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {withdrawMethod === 'bank' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">اسم البنك</label>
                      <input required type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">رقم الحساب أو الآيبان (IBAN)</label>
                      <input required type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-blue-500" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">رقم المحفظة (الهاتف)</label>
                      <input required type="tel" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-blue-500" />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setShowWithdrawForm(false)}
                className="rounded-xl px-6 py-3 font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white hover:bg-slate-800"
              >
                تأكيد طلب السحب
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payouts Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">سجل المستحقات</h3>
        </div>
        <table className="w-full text-right text-sm">
          <thead className="bg-white text-slate-500 border-b border-slate-100">
            <tr>
              <th className="p-4 font-bold">الفترة</th>
              <th className="p-4 font-bold">المبلغ</th>
              <th className="p-4 font-bold">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {payouts.map(payout => (
              <tr key={payout.id}>
                <td className="p-4 font-medium text-slate-800">{payout.period}</td>
                <td className="p-4 font-black text-blue-600">{formatPrice(payout.amount)}</td>
                <td className="p-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    payout.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {payout.status === 'paid' ? 'مدفوع' : 'قيد الانتظار'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
