import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('creative_writing_packages')
    .select('*')
    .order('created_at', { ascending: true });
    
  return NextResponse.json({ data, error, len: data?.length, isDev: process.env.NODE_ENV });
}
