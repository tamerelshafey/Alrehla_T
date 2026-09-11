export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string
          role: string
          is_guardian: boolean | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          role?: string
          is_guardian?: boolean | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          role?: string
          is_guardian?: boolean | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      personalized_products: {
        Row: {
          id: string
          slug: string
          name: string
          category: 'library' | 'custom' | 'subscription'
          price: number
          electronic_price: number | null
          short_description: string
          cover_image_url: string | null
          publisher_id: string | null
          owner_type: 'platform' | 'publisher'
          features: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          category: 'library' | 'custom' | 'subscription'
          price: number
          electronic_price?: number | null
          short_description: string
          cover_image_url?: string | null
          publisher_id?: string | null
          owner_type?: 'platform' | 'publisher'
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          category?: 'library' | 'custom' | 'subscription'
          price?: number
          electronic_price?: number | null
          short_description?: string
          cover_image_url?: string | null
          publisher_id?: string | null
          owner_type?: 'platform' | 'publisher'
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      creative_writing_packages: {
        Row: {
          id: string
          slug: string
          name: string
          age_group: 'under_12' | '12_plus'
          price: number
          duration_text: string
          sessions_count: number
          session_duration: string | null
          target_audience: string
          prerequisite_note: string | null
          prerequisite_package_id: string | null
          short_description: string
          full_description: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          age_group: 'under_12' | '12_plus'
          price: number
          duration_text: string
          sessions_count: number
          session_duration?: string | null
          target_audience: string
          prerequisite_note?: string | null
          prerequisite_package_id?: string | null
          short_description: string
          full_description: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          age_group?: 'under_12' | '12_plus'
          price?: number
          duration_text?: string
          sessions_count?: number
          session_duration?: string | null
          target_audience?: string
          prerequisite_note?: string | null
          prerequisite_package_id?: string | null
          short_description?: string
          full_description?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
