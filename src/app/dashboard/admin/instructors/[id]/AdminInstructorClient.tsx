'use client';
import { formatPrice } from '@/lib/utils';
import React, { useState } from 'react';
import { Instructor, ProfileUpdateRequest, InstructorCertification } from '@/types';
import { CheckCircle2, AlertCircle, XCircle, Calendar, MessageSquare, Save } from 'lucide-react';
import { approveProfileUpdateRequest, rejectProfileUpdateRequest, updateInstructorCertification } from '@/actions/instructors';

interface AdminInstructorClientProps {
  instructor: Instructor;
  updateRequests: ProfileUpdateRequest[];
  certification: InstructorCertification | null;
}

export function AdminInstructorClient({ instructor, updateRequests, certification }: AdminInstructorClientProps) {
  const [trainingPassed, setTrainingPassed] = useState(certification?.examPassed || false);
  const [adminFeedback, setAdminFeedback] = useState('');

  const pendingRequests = updateRequests.filter(r => r.status === 'pending');
  const pastRequests = updateRequests.filter(r => r.status !== 'pending');

  const handleApprove = async (reqId: string) => {
    await approveProfileUpdateRequest(reqId);
  };

  const handleReject = async (reqId: string) => {
    if (!adminFeedback) {
      alert('يرجى كتابة سبب الرفض في خانة النقاش أدناه أولاً.');
      return;
    }
    await rejectProfileUpdateRequest(reqId, adminFeedback);
    setAdminFeedback('');
  };

  const handleTrainingToggle = async (checked: boolean) => {
    setTrainingPassed(checked);
    await updateInstructorCertification(instructor.id, checked);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar Info */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-4 text-lg">معلومات العمل الحالية</h3>
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
                <span className="font-bold text-slate-800">{instructor.monthlyHoursCommitted || 60} ساعة شهرياً</span>
              </div>
            )}
            <div>
              <span className="block text-slate-500 mb-1">السعر المعتمد:</span>
              <span className="font-bold text-slate-800">{instructor.approvedPrice ? `${instructor.approvedPrice} ج.م` : 'غير محدد'}</span>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-4 text-lg">التدريب والاعتماد</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={trainingPassed} 
                onChange={(e) => handleTrainingToggle(e.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-bold text-slate-700">اجتاز التدريب والاختبار</span>
            </label>
            {certification && (
              <div className="text-sm text-slate-600 space-y-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {certification.examScore !== undefined && (
                  <div><span className="font-bold">درجة الاختبار:</span> {certification.examScore}%</div>
                )}
                {certification.trainingMeetingLink && (
                  <div><span className="font-bold">رابط اللقاء:</span> <a href={certification.trainingMeetingLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">اضغط هنا</a></div>
                )}
                {certification.certifiedAt && (
                  <div><span className="font-bold">تاريخ الاعتماد:</span> {new Date(certification.certifiedAt).toLocaleDateString('ar-EG')}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <h3 className="text-xl font-black text-amber-900">طلبات تعديل معلقة ({pendingRequests.length})</h3>
            </div>
            
            {pendingRequests.map(req => (
              <div key={req.id} className="mb-6 last:mb-0 bg-white rounded-2xl p-6 border border-amber-100">
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-500 block mb-2">تاريخ الطلب: {new Date(req.createdAt).toLocaleString('ar-EG')}</span>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-700 mb-2">النظام المطلوب</div>
                      <div>{req.requestedChanges.workModel === 'monthly' ? 'شهري' : 'بالجلسة'}</div>
                      {req.requestedChanges.workModel === 'monthly' && <div>الساعات: {req.requestedChanges.monthlyHoursCommitted}</div>}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-700 mb-2">السعر المطلوب</div>
                      <div>{req.requestedChanges.requestedPrice || 'فئة سعر رقم: ' + req.requestedChanges.selectedPricingOptionId}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-slate-700 mb-3 text-sm">الجدول المطلوب</h4>
                  <div className="flex flex-wrap gap-2">
                    {req.requestedChanges.weeklySchedule?.map((s, idx) => (
                      <span key={idx} className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm text-emerald-800">
                        <span className="font-bold capitalize mr-1">{s.day}:</span> {s.time}
                        {s.commitmentType === 'fixed_term' && <span className="text-xs block text-emerald-600">({s.commitmentMonths} شهور)</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <input 
                    type="text"
                    value={adminFeedback}
                    onChange={(e) => setAdminFeedback(e.target.value)}
                    placeholder="ملاحظات للإرسال للمدرب (مطلوبة في حالة الرفض)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(req.id)} className="flex-1 rounded-xl bg-emerald-600 py-2 font-bold text-white hover:bg-emerald-700">اعتماد</button>
                    <button onClick={() => handleReject(req.id)} className="flex-1 rounded-xl bg-rose-100 py-2 font-bold text-rose-700 hover:bg-rose-200">رفض بالملاحظات</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Schedule */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-6 w-6 text-emerald-600" />
            <h3 className="text-xl font-black text-slate-800">الجدول الأسبوعي المعتمد حالياً</h3>
          </div>
          
          {(!instructor.weeklySchedule || instructor.weeklySchedule.length === 0) ? (
            <p className="text-slate-500 text-sm">لا يوجد جدول معتمد.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(dayKey => {
                const daySlots = instructor.weeklySchedule?.filter(s => s.day === dayKey) || [];
                if (daySlots.length === 0) return null;
                return (
                  <div key={dayKey} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-700 mb-2 capitalize">{dayKey}</h4>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map(s => (
                        <div key={s.time} className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-600 flex flex-col gap-1">
                          <span className="font-bold">{s.time} {s.isBooked && <span className="text-rose-500 mr-1">(محجوز)</span>}</span>
                          {s.commitmentType === 'fixed_term' && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">التزام {s.commitmentMonths} شهور</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Requests / Discussion History */}
        {pastRequests.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-black text-slate-800">سجل الطلبات والملاحظات</h3>
            </div>
            <div className="space-y-4">
              {pastRequests.map(req => (
                <div key={req.id} className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500">{new Date(req.createdAt).toLocaleString('ar-EG')}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {req.status === 'approved' ? 'مُعتمد' : 'مرفوض'}
                    </span>
                  </div>
                  {req.adminFeedback && (
                    <div className="mt-2 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      <span className="font-bold block mb-1">ملاحظة الإدارة:</span>
                      {req.adminFeedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
