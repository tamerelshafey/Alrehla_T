'use client';

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PersonalizedProduct } from '@/types';

import { WizardStepper } from './wizard-steps/WizardStepper';
import { OrderSummarySidebar } from './wizard-steps/OrderSummarySidebar';
import { Step1ChildInfo } from './wizard-steps/Step1ChildInfo';
import { Step2Details } from './wizard-steps/Step2Details';
import { Step3Addons } from './wizard-steps/Step3Addons';
import { Step4Review } from './wizard-steps/Step4Review';
import { useCart } from '@/context/CartContext';
import { createFamilyMember } from '@/app/actions/family';

const wizardSchema = z.object({
  familyMemberId: z.string().optional(),
  newChildName: z.string().optional(),
  newChildBirthDate: z.string().optional(),
  newChildGender: z.enum(['male', 'female']).optional(),
  
  heroDescription: z.string().min(5, 'يجب إدخال وصف للبطل'),
  familyMemberNames: z.string().optional(),
  storyGoal: z.string().min(2, 'الرجاء اختيار الهدف التربوي'),
  facePhotoFile: z.any().refine((file) => file !== null && file !== undefined, 'الصورة الشخصية مطلوبة'),
  secondPhotoFile: z.any().optional(),

  selectedAddonIds: z.array(z.string()),

}).superRefine((data, ctx) => {
  if (!data.familyMemberId && !data.newChildName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'الرجاء اختيار طفل أو إضافة طفل جديد',
      path: ['newChildName']
    });
  }
});

type WizardFormValues = z.infer<typeof wizardSchema>;

export function PersonalizationWizard({ product }: { product: PersonalizedProduct }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { addItem } = useCart();
  
  const currentStep = parseInt(searchParams.get('step') || '1', 10);
  const [isLoaded, setIsLoaded] = useState(false);

  const methods = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      selectedAddonIds: [],
    },
    mode: 'onChange',
  });

  const { handleSubmit, trigger, getValues, reset } = methods;

  useEffect(() => {
    const saved = sessionStorage.getItem(`wizard_state_${product.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Exclude file objects from restoring
        const { facePhotoFile, secondPhotoFile, ...rest } = parsed;
        reset({ ...methods.getValues(), ...rest });
      } catch (e) {
        console.error("Failed to parse saved form state", e);
      }
    }
    setIsLoaded(true);
  }, [product.id, reset, methods]);

  const handleNext = async (stepFields: (keyof WizardFormValues)[]) => {
    const isValid = await trigger(stepFields);
    if (isValid) {
      const values = getValues();
      const { facePhotoFile, secondPhotoFile, ...rest } = values;
      sessionStorage.setItem(`wizard_state_${product.id}`, JSON.stringify(rest));
      router.push(`${pathname}?step=${currentStep + 1}`);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      router.push(`${pathname}?step=${currentStep - 1}`);
    }
  };

  const onSubmit = async (data: WizardFormValues) => {
    // 1. Create family member if new
    let childName = data.newChildName || '';
    if (data.newChildName && data.newChildBirthDate && data.newChildGender && !data.familyMemberId) {
      const newMember = await createFamilyMember(data.newChildName, parseInt(data.newChildBirthDate || '0', 10), data.newChildGender);
      childName = newMember.name;
    } else if (data.familyMemberId) {
       // In real app, we fetch the name. For now let's just use placeholder
       childName = 'مشارك موجود'; 
    }

    // Calculate addon price
    let addonsPrice = 0;
    const addonsData = [
      { id: 'addon-1', price: 150 },
      { id: 'addon-2', price: 50 },
      { id: 'addon-3', price: 100 }
    ];
    data.selectedAddonIds.forEach(id => {
      const addon = addonsData.find(a => a.id === id);
      if (addon) addonsPrice += addon.price;
    });

    // 2. Add to cart
    addItem({
      id: product.id + '-' + Date.now(),
      name: product.name,
      price: product.price + addonsPrice,
      quantity: 1,
      type: product.category === 'subscription' ? 'subscription' : 'custom',
      imageUrl: product.coverImageUrl || `https://picsum.photos/seed/${product.id}/600/800`,
      customizationData: {
        childName,
        childPhotoFile: data.facePhotoFile ? data.facePhotoFile.name : undefined,
        heroDescription: data.heroDescription,
        storyGoal: data.storyGoal,
        familyMemberNames: data.familyMemberNames,
        selectedAddonIds: data.selectedAddonIds,
      }
    });

    // Clear session storage
    sessionStorage.removeItem(`wizard_state_${product.id}`);
    
    // Redirect
    router.push('/cart');
  };

  if (!isLoaded) return null;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-7xl gap-8 px-6 py-12 items-start">
        <div className="flex-1">
          <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <WizardStepper currentStep={currentStep} />
            
            <div className="mt-8">
              {currentStep === 1 && <Step1ChildInfo onNext={() => handleNext(['familyMemberId', 'newChildName', 'newChildBirthDate', 'newChildGender'])} />}
              {currentStep === 2 && <Step2Details onNext={() => handleNext(['heroDescription', 'familyMemberNames', 'storyGoal', 'facePhotoFile'])} onPrev={handlePrev} />}
              {currentStep === 3 && <Step3Addons onNext={() => handleNext(['selectedAddonIds'])} onPrev={handlePrev} />}
              {currentStep === 4 && <Step4Review onPrev={handlePrev} product={product} />}
            </div>
          </div>
        </div>
        
        <div className="w-96 shrink-0 sticky top-24">
          <OrderSummarySidebar product={product} />
        </div>
      </form>
    </FormProvider>
  );
}
