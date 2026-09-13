'use server';
import { createClient } from '@/lib/supabase/server';
import { ChildProfile } from '@/types';
import { revalidatePath } from 'next/cache';

export async function fetchFamilyMembers(): Promise<ChildProfile[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await (supabase as any).from('child_profiles')
    .select('*')
    .eq('user_profile_id', user.id)
    .order('created_at', { ascending: true });
      
  if (error || !data) return [];
    
  return data.map((child: any) => ({
    id: child.id,
    userProfileId: child.user_profile_id,
    fullName: child.full_name,
    birthDate: child.birth_date,
    avatarUrl: child.avatar_url,
    createdAt: child.created_at
  }));
}

export async function createFamilyMember(fullName: string, birthDate: string): Promise<ChildProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await (supabase as any).from('child_profiles')
    .insert({
      user_profile_id: user.id,
      full_name: fullName,
      birth_date: birthDate
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
    avatarUrl: data.avatar_url,
    createdAt: data.created_at
  };
}

export async function updateFamilyMember(id: string, fullName: string, birthDate: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await (supabase as any).from('child_profiles')
    .update({ full_name: fullName, birth_date: birthDate })
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

  const { error } = await (supabase as any).from('child_profiles')
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
