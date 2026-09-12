const fs = require('fs');
let code = fs.readFileSync('src/types/supabase.ts', 'utf8');

// The orders definition needs fixing
const oldOrders = 
`      orders: {
        Row: {
          id: string
          user_id: string
          dependent_participant_id: string | null
          independent_participant_id: string | null
          total_amount: number
          status: 'pending' | 'awaiting_verification' | 'paid' | 'failed' | 'refunded'
          transaction_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dependent_participant_id?: string | null
          independent_participant_id?: string | null
          total_amount: number
          status?: 'pending' | 'awaiting_verification' | 'paid' | 'failed' | 'refunded'
          transaction_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dependent_participant_id?: string | null
          independent_participant_id?: string | null
          total_amount?: number
          status?: 'pending' | 'awaiting_verification' | 'paid' | 'failed' | 'refunded'
          transaction_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }`;

const newOrders = 
`      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: 'pending' | 'awaiting_verification' | 'paid' | 'failed' | 'refunded'
          transaction_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          status?: 'pending' | 'awaiting_verification' | 'paid' | 'failed' | 'refunded'
          transaction_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          status?: 'pending' | 'awaiting_verification' | 'paid' | 'failed' | 'refunded'
          transaction_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }`;
code = code.replace(oldOrders, newOrders);

// Also look at course_subscriptions if it has them
code = code.replace(/dependent_participant_id:\s*string\s*\|\s*null/g, '');
code = code.replace(/independent_participant_id:\s*string\s*\|\s*null/g, '');
code = code.replace(/dependent_participant_id\?:\s*string\s*\|\s*null/g, '');
code = code.replace(/independent_participant_id\?:\s*string\s*\|\s*null/g, '');

fs.writeFileSync('src/types/supabase.ts', code);
