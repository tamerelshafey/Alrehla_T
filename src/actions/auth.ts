'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { syncUserProfile } from '@/data/domains/auth'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  try {
    if (data.user) {
      await syncUserProfile(data.user)
    }
  } catch (syncError: any) {
    await supabase.auth.signOut()
    return { error: syncError.message || 'Authentication error: Failed to synchronize user profile.' }
  }

  // Determine where to redirect based on role, or fallback to dashboard
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  
  const supabase = await createClient()

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Create initial profile in the database
  if (data.user) {
    await supabase.from('user_profiles').insert({
      id: data.user.id,
      full_name: fullName,
      role: 'customer', // Default role
      is_guardian: false
    })
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
