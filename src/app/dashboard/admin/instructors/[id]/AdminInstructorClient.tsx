'use client';
import { formatPrice } from '@/lib/utils';
import React, { useState } from 'react';
import { Instructor, ProfileUpdateRequest, InstructorCertification } from '@/types';
import { CheckCircle2, AlertCircle, XCircle, Calendar, MessageSquare, Save, Layers, Sparkles, FileText, Clock } from 'lucide-react';
import { approveProfileUpdateRequest, rejectProfileUpdateRequest, updateInstructorCertification, setInstructorStatus, setInstructorPackages } from '@/actions/instructors';
import { PackagePicker, type PackageChoice } from '@/components/dashboard/PackagePicker';
import { PLATFORM_TIMEZONE } from '@/lib/timezone';
import { getInstructorChangeItems } from '@/lib/request-summary';
import { useRouter } from 'next/navigation';
import { useAction } from '@/lib/use-action';
import { FormError, FormSuccess, FormNotice } from '@/components/ui/FormError';

interface AdminInstructorClientProps {
  instructor: Instructor;
  updateRequests: ProfileUpdateRequest[];
  certification: InstructorCertification | null;
  packages: PackageChoice[];
  selectedPackageIds: string[];
}

const ARABIC_DAYS: Record<string, string> = {
  saturday: 'السبت',
  sunday: 'الأحد',
  monday: 'الإثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
};

export function AdminInstructorClient({
  instructor,
  updateRequests,
  certification,
  packages,
  selectedPackageIds,
}: AdminInstructorClientProps) {
  const router = useRouter();
  const [trainingPassed, setTrainingPassed] = useState(certification?.examPassed || false);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [status, setStatus] = useState(instructor.status);
  const [statusDone, setStatusDone] = useState('');
  const [pickedPackages, setPickedPackages] = useState<string[]>(selectedPackageIds);
  const [packagesDone, setPackagesDone] = useState('');

  const savePackages = useAction(setInstructorPackages, {
    onSuccess: (result) => {
      if (result.ok) {
        setPackagesDone(
          result.count === 0
            ? 'اتحفظ. المدرب بيظهر في كل الباقات.'
            : `اتحفظ. المدرب بيظهر في ${result.count} باقة.`,
        );
      }
    },
    fallbackError: 'تعذّر حفظ باقات المدرب.',
  });

  /**
   * ⚠️ **الحالة دي هي اللي بتخلّي المدرب يظهر لولي الأمر.**
   *
   *    معالج الحجز بيفلتر `status === 'active'`، ومكانش فيه أي طريق
   *    في الموقع كله يغيّرها — المدرب بيتعمل `pending_training`
   *    ويفضل كده للأبد.
   */
  const changeStatus = useAction(setInstructorStatus, {
    onSuccess: (result) => {
      if (result.ok) {
        setStatus(result.status as typeof instructor.status);
        setStatusDone(
          result.status === 'active'
            ? 'المدرب بقى نشطًا، وهيظهر لأولياء الأمور في معالج الحجز.'
            : 'الحالة اتحدّثت.',
        );
      }
    },
    fallbackError: 'تعذّر تغيير حالة المدرب.',
  });

  const pendingRequests = updateRequests.filter(r => r.status === 'pending');
  const pastRequests = updateRequests.filter(r => r.status !== 'pending');

  /**
   * ⚠️ التلات أزرار دي كانت `await` عارية بلا `try` ولا حالة انتظار.
   *    التلات أكشنز بيرموا (`requireInstructorAdmin` بيرمي، وفحص صفر
   *    صفوف بيرمي) — فالرفض كان بيطلع استثناء لحدود React والإداري
   *    مبيشوفش أي رسالة: يدوس «اعتماد» ومفيش رد فعل.
   */
  const approve = useAction(approveProfileUpdateRequest, {
    onSuccess: () => router.refresh(),
    fallbackError: 'تعذّر اعتماد الطلب.',
  });

  const reject = useAction(rejectProfileUpdateRequest, {
    onSuccess: () => {
      setAdminFeedback('');
      router.refresh();
    },
    fallbackError: 'تعذّر رفض الطلب.',
  });

  /**
   * ⚠️ وده كان أخطرهم: `setTrainingPassed(checked)` كانت **قبل**
   *    الأكشن. يعني لو الحفظ وقع، المربّع بيفضل متغيّرًا في الشاشة
   *    والقاعدة ما اتغيّرش فيها حاجة — الإداري يقفل الصفحة وهو
   *    فاكر إن المدرب اجتاز التدريب.
   *
   *    دلوقتي الشاشة بتتغيّر **بعد** نجاح الحفظ، وبترجع لمكانها لو وقع.
   */
  const certify = useAction(updateInstructorCertification, {
    fallbackError: 'تعذّر حفظ حالة التدريب.',
  });

  const handleApprove = (reqId: string) => approve.run(reqId);

  const handleReject = async (reqId: string) => {
    if (!adminFeedback) {
      alert('يرجى كتابة سبب الرفض في خانة النقاش أدناه أولاً.');
      return;
    }
    await reject.run(reqId, adminFeedback);
  };

  const handleTrainingToggle = async (checked: boolean) => {
    const previous = trainingPassed;
    setTrainingPassed(checked);
    const result = await certify.run(instructor.id, checked);
    if (result === undefined) setTrainingPassed(previous);
    else router.refresh();
  };

  const busy = approve.pending || reject.pending || certify.pending;
  const actionError = approve.error || reject.error || certify.error;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <FormError message={actionError} className="lg:col-span-3" />

      {/* Sidebar Info */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-4 text-lg">معلومات العمل الحالية</h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="block text-slate-500 mb-1">نظام العمل:</span>
              <span className="font-bold text-slate-800">
                {instructor.workModel === 'monthly'
                  ? 'راتب شهري (تواصل مباشر مع الإدارة)'
                  : 'بالجلسة'}
              </span>
            </div>
            {instructor.workModel === 'monthly' ? (
              <div>
                <span className="block text-slate-500 mb-1">الحد الأدنى للساعات:</span>
                <span className="font-bold text-slate-800">
                  {instructor.monthlyHoursCommitted || 60} ساعة شهرياً
                </span>
              </div>
            ) : (
              <div>
                <span className="block text-slate-500 mb-1">السعر المعتمد للجلسة:</span>
                <span className="font-bold text-slate-800">
                  {instructor.approvedPrice ? `${instructor.approvedPrice} ج.م` : 'غير محدد'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-lg font-black text-slate-800">حالة المدرب</h3>
          <p className="mb-4 text-sm font-medium text-slate-500">
            المدرب مايظهرش لأولياء الأمور في معالج الحجز إلا وهو <strong>نشط</strong>.
          </p>

          <FormError message={changeStatus.error} className="mb-3" />
          <FormSuccess message={statusDone} className="mb-3" />

          {!trainingPassed && status !== 'active' && (
            <FormNotice
              className="mb-3"
              message="لازم يجتاز التدريب والاختبار الأول — اظبط الخانة تحت، وبعدين فعّله."
            />
          )}

          <div className="flex flex-wrap gap-2">
            {([
              { value: 'active', label: 'نشط', tone: 'bg-emerald-600 hover:bg-emerald-700' },
              { value: 'pending_approval', label: 'في انتظار الاعتماد', tone: 'bg-amber-600 hover:bg-amber-700' },
              { value: 'suspended', label: 'موقوف', tone: 'bg-rose-600 hover:bg-rose-700' },
            ] as const).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatusDone('');
                  changeStatus.run(instructor.id, option.value);
                }}
                // الزرار بتاع الحالة الحالية مقفول — الضغط عليه مالوش معنى.
                disabled={changeStatus.pending || status === option.value}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-40 ${option.tone}`}
              >
                {status === option.value ? `${option.label} ✓` : option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <h3 className="mb-2 text-lg font-black text-slate-800">الباقات اللي بيدرّبها</h3>
          <p className="mb-4 text-sm font-medium text-slate-500">
            دي اللي بتحدّد يظهر لولي الأمر في أنهي باقة وقت الحجز.
          </p>

          <FormError message={savePackages.error} className="mb-3" />
          <FormSuccess message={packagesDone} className="mb-3" />

          <PackagePicker
            packages={packages}
            selected={pickedPackages}
            onChange={(next) => {
              setPickedPackages(next);
              setPackagesDone('');
            }}
            disabled={savePackages.pending}
          />

          <button
            type="button"
            onClick={() => {
              setPackagesDone('');
              savePackages.run(instructor.id, pickedPackages);
            }}
            disabled={savePackages.pending}
            className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {savePackages.pending ? 'جاري الحفظ...' : 'حفظ الباقات'}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-4 text-lg">التدريب والاعتماد</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={trainingPassed} 
                onChange={(e) => handleTrainingToggle(e.target.checked)}
                disabled={certify.pending}
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
                  <div><span className="font-bold">تاريخ الاعتماد:</span> {new Date(certification.certifiedAt).toLocaleDateString('ar-EG', { timeZone: PLATFORM_TIMEZONE })}</div>
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
            
            {pendingRequests.map(req => {
              const changeItems = getInstructorChangeItems(req.requestedChanges, packages);
              const isPackagesRequest =
                (req.requestedChanges as any)._requestType === 'packages' ||
                (req.requestedChanges.packageIds !== undefined &&
                  req.requestedChanges.weeklySchedule === undefined &&
                  req.requestedChanges.workModel === undefined &&
                  req.requestedChanges.requestedPrice === undefined &&
                  req.requestedChanges.bio === undefined &&
                  req.requestedChanges.specialties === undefined &&
                  req.requestedChanges.displayName === undefined);

              return (
                <div
                  key={req.id}
                  className={`mb-6 last:mb-0 rounded-3xl p-6 border shadow-xs bg-white ${
                    isPackagesRequest ? 'border-indigo-200' : 'border-amber-200'
                  }`}
                >
                  {/* رأس بطاقة الطلب ونوعه */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-white font-black text-sm shadow-2xs ${
                          isPackagesRequest ? 'bg-indigo-600' : 'bg-amber-600'
                        }`}
                      >
                        {isPackagesRequest ? <Layers className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-base">
                            {isPackagesRequest ? 'طلب اعتماد باقات التدريب' : 'طلب تعديل الملف والجدول'}
                          </h4>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              isPackagesRequest
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {isPackagesRequest ? 'باقات تدريب' : 'جدول وملف'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 block mt-0.5">
                          تاريخ الطلب: {new Date(req.createdAt).toLocaleString('ar-EG', { timeZone: PLATFORM_TIMEZONE })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── ملخص التغييرات المطلوبة للإدارة (التعريف والإشارة باختصار للتغييرات) ── */}
                  <div className="mb-5 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
                      <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>ملخص التغييرات في هذا الطلب:</span>
                    </div>
                    {changeItems.length === 0 ? (
                      <p className="text-xs text-slate-600 font-medium">لم يتم تحديد تفاصيل إضافية في هذا الطلب.</p>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        {changeItems.map((item, idx) => (
                          <div key={idx} className="flex flex-wrap items-baseline gap-2 text-xs">
                            <span className="font-bold text-amber-900 shrink-0">• {item.title}:</span>
                            <span className="text-slate-800 font-medium leading-relaxed">{item.detail}</span>
                            {item.badge && (
                              <span className="rounded-md bg-amber-200/80 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* عرض تفصيلي للباقات إذا تضمن الطلب باقات */}
                  {req.requestedChanges.packageIds !== undefined && (
                    <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-indigo-600" />
                        <span>الباقات المطلوبة للاعتماد ({req.requestedChanges.packageIds.length}):</span>
                      </h4>

                      {req.requestedChanges.packageIds.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 font-medium">
                          طلب التدريب في <strong>جميع الباقات المتاحة بالمنصة</strong> دون حصر أو استثناء.
                        </div>
                      ) : (
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {req.requestedChanges.packageIds.map((pkgId) => {
                            const pkg = packages.find((p) => p.id === pkgId);
                            const isCurrent = (instructor.packageIds || []).includes(pkgId);
                            return (
                              <div
                                key={pkgId}
                                className="flex items-center justify-between rounded-xl border border-indigo-200/80 bg-white p-3 text-xs shadow-2xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-900 block">{pkg?.name || pkgId}</span>
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    {pkg?.sessionsCount ? `${pkg.sessionsCount} جلسات` : ''}
                                    {pkg?.ageGroup ? ` • ${pkg.ageGroup}` : ''}
                                  </span>
                                </div>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                    isCurrent
                                      ? 'bg-slate-100 text-slate-600'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}
                                >
                                  {isCurrent ? 'معتمدة حالياً' : 'مطلوبة حديثاً'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* عرض تفصيلي لباقي الحقول (نظام العمل، التسعير، الجدول) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    {req.requestedChanges.workModel !== undefined && (
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1.5 text-xs">نظام العمل المطلوب</div>
                        <div className="font-black text-slate-900">
                          {req.requestedChanges.workModel === 'monthly'
                            ? 'راتب شهري (تواصل مباشر مع الإدارة)'
                            : 'بالجلسة'}
                        </div>
                        {req.requestedChanges.workModel === 'monthly' && (
                          <div className="text-xs text-slate-500 mt-1 font-medium">
                            الساعات: {req.requestedChanges.monthlyHoursCommitted || 60} ساعة شهرياً
                          </div>
                        )}
                      </div>
                    )}

                    {req.requestedChanges.workModel !== 'monthly' &&
                      (req.requestedChanges.requestedPrice !== undefined ||
                        req.requestedChanges.selectedPricingOptionId !== undefined) && (
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                          <div className="font-bold text-slate-700 mb-1.5 text-xs">حصيلة الجلسة المطلوبة</div>
                          <div className="font-black text-slate-900">
                            {req.requestedChanges.requestedPrice ? `${req.requestedChanges.requestedPrice} ج.م` : 'غير محدد'}
                          </div>
                        </div>
                      )}

                    {req.requestedChanges.displayName !== undefined && (
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1.5 text-xs">الاسم المعروض</div>
                        <div className="font-bold text-slate-900">{req.requestedChanges.displayName}</div>
                      </div>
                    )}

                    {req.requestedChanges.yearsExperience !== undefined && (
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1.5 text-xs">سنوات الخبرة</div>
                        <div className="font-bold text-slate-900">{req.requestedChanges.yearsExperience} سنوات</div>
                      </div>
                    )}

                    {req.requestedChanges.bio !== undefined && (
                      <div className="col-span-1 md:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1.5 text-xs">النبذة المطلوبة</div>
                        <div className="leading-relaxed whitespace-pre-wrap text-slate-800 text-xs font-medium">
                          {req.requestedChanges.bio || '— فارغة —'}
                        </div>
                      </div>
                    )}

                    {req.requestedChanges.specialties !== undefined && (
                      <div className="col-span-1 md:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <div className="font-bold text-slate-700 mb-1.5 text-xs">التخصصات المطلوبة</div>
                        <div className="flex flex-wrap gap-1.5">
                          {req.requestedChanges.specialties.length === 0 && <span className="text-slate-400 text-xs">— فارغة —</span>}
                          {req.requestedChanges.specialties.map((sp, i) => (
                            <span key={i} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700">
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {req.requestedChanges.weeklySchedule !== undefined && (
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>الجدول الأسبوعي المطلوب ({req.requestedChanges.weeklySchedule?.length || 0} موعد):</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {req.requestedChanges.weeklySchedule?.map((s, idx) => (
                          <span key={idx} className="rounded-xl bg-white border border-emerald-200 px-3 py-1.5 text-xs text-emerald-900 shadow-2xs">
                            <span className="font-black mr-1 text-slate-800">{ARABIC_DAYS[s.day] || s.day}:</span>
                            <span className="font-black">{s.time}</span>
                            {s.commitmentType === 'fixed_term' && (
                              <span className="text-[11px] block text-amber-800 font-bold mt-0.5">
                                مؤقت حتى يوم: {s.commitmentEndsAt || (s.commitmentMonths ? `${s.commitmentMonths} شهور` : 'تاريخ محدد')}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
                    <input 
                      type="text"
                      value={adminFeedback}
                      onChange={(e) => setAdminFeedback(e.target.value)}
                      placeholder="ملاحظات للإرسال للمدرب (مطلوبة في حالة الرفض)"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-amber-500"
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleApprove(req.id)}
                        disabled={busy}
                        aria-busy={approve.pending || undefined}
                        className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-xs"
                      >
                        {approve.pending ? 'جارٍ الاعتماد…' : 'اعتماد هذا الطلب'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(req.id)}
                        disabled={busy}
                        aria-busy={reject.pending || undefined}
                        className="flex-1 rounded-xl bg-rose-100 py-2.5 font-bold text-rose-700 hover:bg-rose-200 disabled:opacity-60 transition-colors"
                      >
                        {reject.pending ? 'جارٍ الرفض…' : 'رفض بالملاحظات'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  <div key={dayKey} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-700 mb-2">{ARABIC_DAYS[dayKey] || dayKey}</h4>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map(s => (
                        <div key={s.time} className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm text-slate-600 flex flex-col gap-1">
                          <span className="font-bold">{s.time} {s.isBooked && <span className="text-rose-500 mr-1">(محجوز)</span>}</span>
                          {s.commitmentType === 'fixed_term' && (
                            <span className="text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                              مؤقت حتى يوم: {s.commitmentEndsAt || (s.commitmentMonths ? `${s.commitmentMonths} شهور` : 'تاريخ محدد')}
                            </span>
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
              {pastRequests.map(req => {
                const pastChangeItems = getInstructorChangeItems(req.requestedChanges, packages);
                const isPackages = (req.requestedChanges as any)._requestType === 'packages' ||
                  (req.requestedChanges.packageIds !== undefined &&
                   req.requestedChanges.weeklySchedule === undefined &&
                   req.requestedChanges.workModel === undefined);

                return (
                  <div key={req.id} className="rounded-3xl bg-slate-50 p-4 border border-slate-200/80 space-y-2.5">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isPackages ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isPackages ? 'طلب باقات' : 'طلب جدول وملف'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(req.createdAt).toLocaleString('ar-EG', { timeZone: PLATFORM_TIMEZONE })}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {req.status === 'approved' ? 'مُعتمد' : 'مرفوض'}
                      </span>
                    </div>

                    {/* ملخص التغييرات في الطلب السابق */}
                    {pastChangeItems.length > 0 && (
                      <div className="rounded-xl bg-white p-3 border border-slate-200/70 text-xs space-y-1">
                        <span className="font-bold text-slate-700 block mb-1">التغييرات المطلوبة في هذا الطلب:</span>
                        {pastChangeItems.map((item, idx) => (
                          <div key={idx} className="flex items-baseline gap-1.5 text-slate-600">
                            <span className="font-bold text-slate-800">• {item.title}:</span>
                            <span>{item.detail}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {req.adminFeedback && (
                      <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                        <span className="font-bold block mb-1 text-slate-900">ملاحظة الإدارة:</span>
                        {req.adminFeedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
