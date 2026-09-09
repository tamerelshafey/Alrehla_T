'use client';
import { formatPrice } from '@/lib/utils';

import React, { useState } from 'react';
import { Instructor, DayOfWeek } from '@/types';
import { CheckCircle2, AlertCircle, XCircle, Calendar, MessageSquare, Save } from 'lucide-react';

interface AdminInstructorClientProps {
  instructor: Instructor;
}

export function AdminInstructorClient({ instructor }: AdminInstructorClientProps) {
  const [approvedPrice, setApprovedPrice] = useState(instructor.approvedPrice || instructor.requestedPrice || 0);
  const [status, setStatus] = useState(instructor.status);
  const [trainingPassed, setTrainingPassed] = useState(instructor.trainingPassed);

  const [message, setMessage] = useState('');
  const [messagesList, setMessagesList] = useState<{sender: string, text: string}[]>([]);

  const handleSave = () => {
    alert('تم حفظ الإعدادات');
  };

  const handleSendMessage = () => {
    if (!message) return;
    setMessagesList([...messagesList, { sender: 'الإدارة', text: message }]);
    setMessage('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar Info */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-4 text-lg">معلومات العمل</h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="block text-slate-500 mb-1">نظام العمل:</span>
              <span className="font-bold text-slate-800">
                {instructor.workModel === 'monthly' ? 'راتب شهري' : 'بالجلسة'}
              </span>
            </div>
            {instructor.workModel === 'monthly' && (
              <div>
                <span className="block text-slate-500 mb-1">الحد الأدنى للساعات:</span>
                <span className="font-bold text-slate-800">{instructor.monthlyHoursCommitted} ساعة شهرياً</span>
              </div>
            )}
            <div>
              <span className="block text-slate-500 mb-1">السعر المطلوب من المدرب:</span>
              <span className="font-bold text-slate-800">{formatPrice(instructor.requestedPrice)}</span>
            </div>
            <div>
              <span className="block text-slate-500 mb-1">عدد سنوات الخبرة:</span>
              <span className="font-bold text-slate-800">{instructor.yearsExperience}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-4 text-lg">إدارة واعتماد المدرب</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={trainingPassed} 
                onChange={(e) => setTrainingPassed(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-bold text-slate-700">اجتاز التدريب والاختبار</span>
            </label>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">السعر المعتمد النهائي</label>
              <input 
                type="number" 
                value={approvedPrice}
                onChange={(e) => setApprovedPrice(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">تغيير الحالة</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 focus:border-emerald-500 outline-none"
              >
                <option value="pending_training">قيد التدريب</option>
                <option value="pending_approval">في انتظار الاعتماد</option>
                <option value="active">نشط</option>
                <option value="suspended">موقوف</option>
              </select>
            </div>

            <button onClick={handleSave} className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800 transition-colors">
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Schedule */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-6 w-6 text-emerald-600" />
            <h3 className="text-xl font-black text-slate-800">الجدول الأسبوعي المعتمد</h3>
          </div>
          
          {(!instructor.weeklySchedule || instructor.weeklySchedule.length === 0) ? (
            <p className="text-slate-500 text-sm">لم يقم المدرب بتحديد جدوله بعد.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(dayKey => {
                const daySlots = instructor.weeklySchedule.filter(s => s.day === dayKey);
                if (daySlots.length === 0) return null;
                return (
                  <div key={dayKey} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-700 mb-2 capitalize">{dayKey}</h4>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map(s => (
                        <span key={s.time} className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-sm font-bold text-slate-600">
                          {s.time} {s.isBooked && <span className="text-rose-500 mr-1">(محجوز)</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Discussion */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-black text-slate-800">نقاش الإدارة مع المدرب</h3>
          </div>

          <div className="space-y-4 mb-6">
            {messagesList.length === 0 ? (
              <p className="text-slate-500 text-sm">لا توجد رسائل سابقة. يمكنك بدء النقاش حول المواعيد أو الأسعار.</p>
            ) : (
              messagesList.map((msg, i) => (
                <div key={i} className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="font-bold text-slate-800 text-xs mb-1">{msg.sender}</div>
                  <div className="text-slate-600 text-sm">{msg.text}</div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالة للمدرب..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-emerald-500 outline-none"
            />
            <button onClick={handleSendMessage} className="rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-700">
              إرسال
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
