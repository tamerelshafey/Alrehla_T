'use client';
import React, { useState } from 'react';
import { Instructor, WeeklySlot } from '@/types';
import { Calendar, Clock, User, ArrowRight, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface BookingWizardProps {
  instructors: Instructor[];
}

export function BookingWizardClient({ instructors }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState('شغف الكتابة (3 أشهر)');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<WeeklySlot | null>(null);

  const activeInstructors = instructors.filter(i => i.status === 'active');
  const selectedInstructor = activeInstructors.find(i => i.id === selectedInstructorId);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/creative-writing/booking/confirm?package=${encodeURIComponent(selectedPackage)}&instructor=${encodeURIComponent(selectedInstructorId)}`);
  };

  return (
    <Card accentColor="emerald" className="p-6 md:p-10 shadow-xl shadow-slate-200/50">
      <form onSubmit={handleConfirm} className="space-y-8">
        
        {/* Step 1: Package & Instructor */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">1</div>
                اختيار الباقة والمدرب
              </h2>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">الباقة المختارة</label>
                <select 
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-emerald-500"
                >
                  <option>بذرة الخيال (شهر واحد)</option>
                  <option>شغف الكتابة (3 أشهر)</option>
                  <option>مشروع كاتب (6 أشهر)</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700">المدرب المفضل</label>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeInstructors.map(inst => (
                    <div 
                      key={inst.id}
                      onClick={() => { setSelectedInstructorId(inst.id); setSelectedSlot(null); }}
                      className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                        selectedInstructorId === inst.id 
                          ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                          : 'border-slate-100 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                          {inst.displayName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{inst.displayName}</h4>
                          <p className="text-xs text-slate-500">{inst.specialties.join('، ')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Button
              type="button"
              onClick={handleNext}
              disabled={!selectedInstructorId}
              accentColor="emerald"
              className="w-full py-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              متابعة لاختيار الموعد
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Button>
          </div>
        )}

        {/* Step 2: Recurring Slot */}
        {step === 2 && selectedInstructor && (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">2</div>
                الموعد الأسبوعي الثابت
              </h2>
              
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-bold mb-1">الجدول الأسبوعي:</p>
                <p>يتم اختيار الموعد مرة واحدة، وسيكون هو <strong>موعدك الثابت في نفس اليوم والساعة أسبوعياً</strong> طوال فترة الباقة.</p>
              </div>

              {(!selectedInstructor.weeklySchedule || selectedInstructor.weeklySchedule.length === 0) ? (
                <p className="text-slate-500 text-center py-4">لا توجد مواعيد متاحة حالياً لهذا المدرب.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(dayKey => {
                    const daySlots = selectedInstructor.weeklySchedule.filter(s => s.day === dayKey && !s.isBooked);
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={dayKey} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <h4 className="font-bold text-slate-700 mb-3 capitalize">{dayKey}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {daySlots.map(s => {
                            const isSelected = selectedSlot?.day === s.day && selectedSlot?.time === s.time;
                            return (
                              <button
                                key={s.time}
                                type="button"
                                onClick={() => setSelectedSlot(s)}
                                className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                                  isSelected 
                                    ? 'bg-emerald-600 text-white shadow-md' 
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400'
                                }`}
                              >
                                {s.time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handlePrev}
                variant="secondary"
                accentColor="emerald"
                className="w-1/3 py-4 text-center"
              >
                رجوع
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!selectedSlot}
                accentColor="emerald"
                className="flex-1 py-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                متابعة البيانات
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: User Info & Confirm */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm text-emerald-600">3</div>
                تأكيد البيانات والحجز
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">اسم المتدرب</label>
                  <input required type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-emerald-500" placeholder="الاسم" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">مجال الاهتمام</label>
                  <input required type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 outline-none focus:border-emerald-500" placeholder="مثال: كتابة القصة القصيرة" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="font-bold text-slate-800 mb-4">ملخص الحجز:</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex justify-between border-b border-slate-200 pb-2">
                    <span>الباقة:</span>
                    <span className="font-bold text-slate-800">{selectedPackage}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-200 pb-2">
                    <span>المدرب:</span>
                    <span className="font-bold text-slate-800">{selectedInstructor?.displayName}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-200 pb-2">
                    <span>الموعد الأسبوعي (يومي وثابت):</span>
                    <span className="font-bold text-emerald-600">{selectedSlot?.day} - الساعة {selectedSlot?.time}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handlePrev}
                variant="secondary"
                accentColor="emerald"
                className="w-1/3 py-4 text-center"
              >
                رجوع
              </Button>
              <Button
                type="submit"
                accentColor="emerald"
                className="flex-1 !bg-slate-900 !text-white hover:!bg-slate-800 py-4 text-center"
              >
                تأكيد الحجز والدفع
              </Button>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
}
