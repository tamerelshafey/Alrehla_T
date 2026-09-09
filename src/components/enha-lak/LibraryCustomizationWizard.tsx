'use client';
import { formatPrice } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PersonalizedProduct } from '@/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

import { WizardStepper } from './wizard-steps/WizardStepper';
import { Step1ChildInfo } from './wizard-steps/Step1ChildInfo';
import { Step2CoverDetails } from './wizard-steps/Step2CoverDetails';
import { Step3LibraryReview } from './wizard-steps/Step3LibraryReview';
import Image from 'next/image';

const librarySchema = z.object({
  familyMemberId: z.string().optional(),
  newChildName: z.string().optional(),
  newChildBirthDate: z.string().optional(),
  newChildGender: z.string().optional(),
  
  dedicationText: z.string().optional(),
  coverPhotoFile: z.any().optional(),
}).refine(data => data.familyMemberId || data.newChildName, {
  message: 'يجب اختيار طفل من العائلة أو إضافة طفل جديد',
  path: ['newChildName'],
});

type LibraryFormValues = z.infer<typeof librarySchema>;

export function LibraryCustomizationWizard({ product }: { product: PersonalizedProduct }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { addItem } = useCart();
  
  const currentStep = parseInt(searchParams.get('step') || '1', 10);
  
  const methods = useForm<LibraryFormValues>({
    resolver: zodResolver(librarySchema),
    mode: 'onChange',
    defaultValues: {
      familyMemberId: '',
      newChildName: '',
      newChildBirthDate: '',
      newChildGender: '',
      dedicationText: '',
      coverPhotoFile: undefined,
    }
  });

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    const saved = sessionStorage.getItem(`library_wizard_${product.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(key => {
          if (key !== 'coverPhotoFile') {
            methods.setValue(key as any, parsed[key]);
          }
        });
      } catch (e) {}
    }
  }, [product.id, methods]);

  useEffect(() => {
    const subscription = methods.watch((value) => {
      const toSave = { ...value };
      delete toSave.coverPhotoFile;
      sessionStorage.setItem(`library_wizard_${product.id}`, JSON.stringify(toSave));
    });
    return () => subscription.unsubscribe();
  }, [methods.watch, product.id]);

  const goToStep = (step: number) => {
    router.push(`${pathname}?step=${step}`);
  };

  const onNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      goToStep(currentStep + 1);
    }
  };

  const onPrev = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: LibraryFormValues) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      price: product.price,
      quantity: 1,
      type: 'book',
      imageUrl: product.coverImageUrl || `https://picsum.photos/seed/${product.id}/600/800`,
      customizationData: {
        childName: data.newChildName || 'مشارك من العائلة',
        dedicationText: data.dedicationText,
      }
    });

    sessionStorage.removeItem(`library_wizard_${product.id}`);
    router.push('/cart');
  };

  if (!isClient) return null;

  return (
    <div className="mx-auto w-full max-w-6xl py-8">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-black text-slate-800">تخصيص الغلاف: {product.name}</h1>
        <p className="text-slate-600">ثلاث خطوات بسيطة لإضافة لمسة شخصية للكتاب</p>
      </div>

      <div className="mb-12 px-4 md:px-12">
        <div className="flex w-full items-center justify-between">
          {[
            { step: 1, label: 'بيانات الطفل' },
            { step: 2, label: 'تخصيص الغلاف' },
            { step: 3, label: 'المراجعة' },
          ].map((s, idx) => {
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
                
                {idx !== 2 && (
                  <div className={`absolute top-5 left-[-50%] w-full h-[2px] -z-10
                    ${currentStep > s.step ? 'bg-emerald-500' : 'bg-slate-200'}`} 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 md:p-10">
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                {currentStep === 1 && <Step1ChildInfo onNext={onNext} />}
                {currentStep === 2 && <Step2CoverDetails onNext={onNext} onPrev={onPrev} />}
                {currentStep === 3 && <Step3LibraryReview onPrev={onPrev} product={product} />}
              </form>
            </FormProvider>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 sticky top-24">
            <h3 className="text-xl font-black text-slate-800 mb-6">ملخص الطلب</h3>
            
            <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {product.coverImageUrl ? (
                  <Image src={product.coverImageUrl} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : null}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{product.name}</h4>
                <p className="text-sm text-slate-500 mt-1">{formatPrice(product.price)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-black text-slate-800 mt-4">
              <span>الإجمالي:</span>
              <span className="text-emerald-500">{formatPrice(product.price)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
