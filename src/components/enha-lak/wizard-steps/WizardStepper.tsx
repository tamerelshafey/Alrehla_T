import React from 'react';

const steps = [
  { step: 1, label: 'بيانات الطفل' },
  { step: 2, label: 'تفاصيل القصة' },
  { step: 3, label: 'الإضافات' },
  { step: 4, label: 'المراجعة' },
];

export function WizardStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex w-full items-center justify-between">
      {steps.map((s, idx) => {
        const isCompleted = currentStep > s.step;
        const isCurrent = currentStep === s.step;
        
        return (
          <div key={s.step} className="flex flex-col items-center gap-2 relative z-10 flex-1">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors
              ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 
                isCurrent ? 'bg-white border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}>
              {isCompleted ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.step
              )}
            </div>
            <span className={`text-sm font-bold ${isCurrent || isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
              {s.label}
            </span>
            
            {/* Connector Line */}
            {idx !== steps.length - 1 && (
              <div className={`absolute top-5 left-[-50%] w-full h-[2px] -z-10
                ${currentStep > s.step ? 'bg-emerald-500' : 'bg-slate-200'}`} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
