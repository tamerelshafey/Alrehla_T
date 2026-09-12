'use server';
import { createClient } from '@/lib/supabase/server';
import { ChildProfile } from '@/types';
import { revalidatePath } from 'next/cache';

export async function fetchFamilyMembers(): Promise<ChildProfile[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_profile_id', user.id)
    .order('created_at', { ascending: true });
    
  if (error || !data) return [];
  
  return data.map(child => ({
    id: child.id,
    userProfileId: child.user_profile_id,
    name: child.name,
    age: child.age,
    createdAt: child.created_at
  }));
}

export async function createFamilyMember(name: string, age: number, gender: string = 'male'): Promise<ChildProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      user_profile_id: user.id,
      name,
      age
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
    name: data.name,
    age: data.age,
    createdAt: data.created_at
  };
}

export async function updateFamilyMember(id: string, name: string, age: number): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('child_profiles')
    .update({ name, age })
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

  const { error } = await supabase
    .from('child_profiles')
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
