'use server';
import { createClient } from '@/lib/supabase/server';
import { ChildProfile } from '@/types';
import { revalidatePath } from 'next/cache';

export async function fetchFamilyMembers(): Promise<ChildProfile[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from('child_profiles')
    .select('*')
    .eq('user_profile_id', user.id)
    .order('created_at', { ascending: true });
      
  if (error || !data) return [];
    
  return data.map((child: any) => ({
    id: child.id,
    userProfileId: child.user_profile_id,
    fullName: child.full_name,
    birthDate: child.birth_date,
    gender: (child.gender as 'male' | 'female' | null) ?? null,
    avatarUrl: child.avatar_url,
    createdAt: child.created_at,
    accountProfileId: child.account_profile_id ?? null
  }));
}

export async function createFamilyMember(
  fullName: string,
  birthDate: string,
  gender?: 'male' | 'female' | null,
): Promise<ChildProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase.from('child_profiles')
    .insert({
      user_profile_id: user.id,
      full_name: fullName,
      birth_date: birthDate,
      gender: gender ?? null
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error creating child profile', error);
    throw new Error('Failed to create child profile');
  }

  revalidatePath('/account/family');

  return {
    id: data.id,
    userProfileId: data.user_profile_id,
    fullName: data.full_name,
    birthDate: data.birth_date,
    gender: (data.gender as 'male' | 'female' | null) ?? null,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at
  };
}

export async function updateFamilyMember(
  id: string,
  fullName: string,
  birthDate: string,
  gender?: 'male' | 'female' | null,
): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('child_profiles')
    .update({ full_name: fullName, birth_date: birthDate, gender: gender ?? null })
    .eq('id', id)
    .eq('user_profile_id', user.id);

  if (error) {
    console.error('Error updating child profile', error);
    return false;
  }

  revalidatePath('/account/family');
  return true;
}

export async function deleteFamilyMember(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('child_profiles')
    .delete()
    .eq('id', id)
    .eq('user_profile_id', user.id);

  if (error) {
    console.error('Error deleting child profile', error);
    return false;
  }

  revalidatePath('/account/family');
  return true;
}

/**
 * تحديد المشارك في معالجات الطلب — اختيار من العائلة أو إضافة جديد.
 *
 * ثلاث مشاكل كانت هنا، كل واحدة في معالج:
 *   • معالج المكتبة كان بيجمع بيانات الطفل و**ما بيحفظهاش خالص**، ولو
 *     الاسم فاضي بيكتب في الطلب نص ثابت «مشارك من العائلة» — حتى لو
 *     العميل اختار طفل موجود. يعني الكتاب ممكن يتطبع باسم غلط.
 *   • معالج التخصيص كان بيعمل **ملف طفل جديد مع كل طلب** لو الاسم
 *     اتكتب، من غير أي فحص تكرار — فالعيلة بتتلخبط بعد كام طلب.
 *   • وتاريخ الميلاد كان بيتلفّق: الخانة بتاخد سنة والكود بيحط أول يناير.
 *
 * الدالة دي هي المكان الواحد اللي بيحسم الحكاية: بترجّع رقم المشارك
 * واسمه الحقيقي، وبتعيد استخدام الملف الموجود بدل ما تعمل نسخة.
 */
export async function resolveWizardChild(params: {
  familyMemberId?: string;
  newChildName?: string;
  newChildBirthDate?: string;
  newChildGender?: 'male' | 'female' | '' | null;
}): Promise<{ childId?: string; childName: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('يجب تسجيل الدخول أولاً');

  // (1) اختار واحد من عيلته: الاسم بييجي من الملف نفسه، مش من الواجهة.
  if (params.familyMemberId) {
    const { data } = await supabase
      .from('child_profiles')
      .select('id, full_name')
      .eq('id', params.familyMemberId)
      .eq('user_profile_id', user.id)
      .maybeSingle();

    if (!data) throw new Error('ملف المشارك المختار غير موجود');
    return { childId: data.id, childName: data.full_name };
  }

  const name = (params.newChildName ?? '').trim();
  if (!name) throw new Error('اختار مشاركًا من العائلة أو أضف واحدًا جديدًا');

  const birthDate = (params.newChildBirthDate ?? '').trim() || null;

  // (2) نفس الاسم ونفس تاريخ الميلاد = نفس الطفل. بنعيد استخدامه بدل
  //     ما نعمل نسخة تانية في العيلة.
  const { data: existing } = await supabase
    .from('child_profiles')
    .select('id, full_name, birth_date')
    .eq('user_profile_id', user.id)
    .eq('full_name', name);

  const match = (existing ?? []).find(
    (c) => (c.birth_date ?? null) === birthDate,
  );

  if (match) {
    return { childId: match.id, childName: match.full_name };
  }

  const { data: created, error } = await supabase
    .from('child_profiles')
    .insert({
      user_profile_id: user.id,
      full_name: name,
      birth_date: birthDate,
      gender: params.newChildGender || null,
    })
    .select('id, full_name')
    .single();

  if (error || !created) {
    console.error('Error creating child from wizard', error);
    throw new Error('تعذّر حفظ بيانات المشارك');
  }

  revalidatePath('/account/family');
  return { childId: created.id, childName: created.full_name };
}
