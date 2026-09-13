'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/data/domains/auth';
import { hasAdminPermission } from '@/lib/utils';

/**
 * Admin-only management of which instructor provides which creative service,
 * and for how much.
 *
 * Authorisation is checked twice on purpose: here, so the caller gets a clear
 * error, and again by row-level security on `instructor_services`, which only
 * admins may write. The app-level check alone has been the weak point in this
 * codebase before — it is never the only guard.
 */

async function requireInstructorAdmin() {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManageInstructors')) {
    throw new Error('غير مصرح لك بإدارة خدمات المدربين');
  }
  return user;
}

export async function saveInstructorServiceOffer(params: {
  instructorId: string;
  serviceId: string;
  approvedPrice: number | null;
  isActive: boolean;
  adminNotes?: string;
}) {
  await requireInstructorAdmin();
  const supabase = await createClient();

  const { instructorId, serviceId, approvedPrice, isActive, adminNotes } = params;

  // A price is what makes the offer real; without one it stays pending so it
  // never reaches a visitor half-configured.
  const status = approvedPrice != null && approvedPrice > 0 ? 'approved' : 'pending';

  const { error } = await supabase
    .from('instructor_services')
    .upsert(
      {
        instructor_id: instructorId,
        service_id: serviceId,
        approved_price: approvedPrice,
        status,
        is_active: isActive,
        admin_notes: adminNotes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'instructor_id,service_id' }
    );

  if (error) {
    console.error('Error saving instructor service offer', error);
    throw new Error('تعذّر حفظ الخدمة');
  }

  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  revalidatePath('/creative-writing/services');
  return { ok: true };
}

export async function removeInstructorServiceOffer(
  instructorId: string,
  serviceId: string
) {
  await requireInstructorAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('instructor_services')
    .delete()
    .eq('instructor_id', instructorId)
    .eq('service_id', serviceId);

  if (error) {
    console.error('Error removing instructor service offer', error);
    throw new Error('تعذّر حذف الخدمة');
  }

  revalidatePath(`/dashboard/admin/instructors/${instructorId}`);
  revalidatePath('/creative-writing/services');
  return { ok: true };
}
