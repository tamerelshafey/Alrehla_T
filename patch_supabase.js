const fs = require('fs');
let code = fs.readFileSync('src/types/supabase.ts', 'utf8');
code = code.replace(
`    Tables: {`,
`    Tables: {
      child_profiles: {
        Row: { id: string; user_profile_id: string; name: string; age: number; created_at: string; }
        Insert: { id?: string; user_profile_id: string; name: string; age: number; created_at?: string; }
        Update: { id?: string; user_profile_id?: string; name?: string; age?: number; created_at?: string; }
      }
      course_subscriptions: {
        Row: { id: string; package_id: string; user_id: string; participant_type: string; child_id: string | null; status: string; started_at: string; created_at: string; }
        Insert: { id?: string; package_id: string; user_id: string; participant_type: string; child_id?: string | null; status?: string; started_at?: string; created_at?: string; }
        Update: { id?: string; package_id?: string; user_id?: string; participant_type?: string; child_id?: string | null; status?: string; started_at?: string; created_at?: string; }
      }
      sessions: {
        Row: { id: string; course_subscription_id: string; instructor_id: string | null; session_number: number; scheduled_at: string; status: string; created_at: string; updated_at: string; }
        Insert: { id?: string; course_subscription_id: string; instructor_id?: string | null; session_number: number; scheduled_at: string; status?: string; created_at?: string; updated_at?: string; }
        Update: { id?: string; course_subscription_id?: string; instructor_id?: string | null; session_number?: number; scheduled_at?: string; status?: string; created_at?: string; updated_at?: string; }
      }
      session_messages: {
        Row: { id: string; session_id: string; sender_name: string; message: string; created_at: string; }
        Insert: { id?: string; session_id: string; sender_name: string; message: string; created_at?: string; }
        Update: { id?: string; session_id?: string; sender_name?: string; message?: string; created_at?: string; }
      }
      session_attachments: {
        Row: { id: string; session_id: string; file_name: string; file_url: string; created_at: string; }
        Insert: { id?: string; session_id: string; file_name: string; file_url: string; created_at?: string; }
        Update: { id?: string; session_id?: string; file_name?: string; file_url?: string; created_at?: string; }
      }
`);
fs.writeFileSync('src/types/supabase.ts', code);
