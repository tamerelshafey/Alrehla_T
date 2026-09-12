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
      orders: {
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
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          customization_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          customization_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          customization_data?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      instructors: {
        Row: {
          id: string
          user_id: string
          display_name: string
          bio: string
          specialties: string[]
          years_experience: number
          is_sample: boolean
          status: 'pending_training' | 'pending_approval' | 'active' | 'suspended'
          training_passed: boolean
          work_model: 'per_session' | 'monthly'
          requested_price: number | null
          selected_pricing_option_id: string | null
          approved_price: number | null
          weekly_schedule: Json | null
          pending_schedule: Json | null
          monthly_hours_committed: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          display_name: string
          bio: string
          specialties: string[]
          years_experience: number
          is_sample?: boolean
          status?: 'pending_training' | 'pending_approval' | 'active' | 'suspended'
          training_passed?: boolean
          work_model?: 'per_session' | 'monthly'
          requested_price?: number | null
          selected_pricing_option_id?: string | null
          approved_price?: number | null
          weekly_schedule?: Json | null
          pending_schedule?: Json | null
          monthly_hours_committed?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          bio?: string
          specialties?: string[]
          years_experience?: number
          is_sample?: boolean
          status?: 'pending_training' | 'pending_approval' | 'active' | 'suspended'
          training_passed?: boolean
          work_model?: 'per_session' | 'monthly'
          requested_price?: number | null
          selected_pricing_option_id?: string | null
          approved_price?: number | null
          weekly_schedule?: Json | null
          pending_schedule?: Json | null
          monthly_hours_committed?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          dependent_participant_id: string | null
          independent_participant_id: string | null
          package_id: string
          instructor_id: string | null
          course_subscription_id: string | null
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          scheduled_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          dependent_participant_id?: string | null
          independent_participant_id?: string | null
          package_id: string
          instructor_id?: string | null
          course_subscription_id?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          scheduled_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dependent_participant_id?: string | null
          independent_participant_id?: string | null
          package_id?: string
          instructor_id?: string | null
          course_subscription_id?: string | null
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
          scheduled_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          }
        ]
      }
      testimonials: {
        Row: {
          id: string
          author_name: string
          author_role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          author_name: string
          author_role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          author_name?: string
          author_role?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string
          content: string
          cover_image_url: string | null
          author_name: string
          published_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt: string
          content: string
          cover_image_url?: string | null
          author_name?: string
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string
          content?: string
          cover_image_url?: string | null
          author_name?: string
          published_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      box_subscriptions: {
        Row: {
          id: string
          user_id: string | null
          customer_name: string
          plan_name: string
          status: 'active' | 'cancelled' | 'paused'
          next_shipment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer_name: string
          plan_name: string
          status?: 'active' | 'cancelled' | 'paused'
          next_shipment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          customer_name?: string
          plan_name?: string
          status?: 'active' | 'cancelled' | 'paused'
          next_shipment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "box_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string | null
          requester_name: string
          subject: string
          category: string
          status: 'open' | 'answered' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          requester_name: string
          subject: string
          category: string
          status?: 'open' | 'answered' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          requester_name?: string
          subject?: string
          category?: string
          status?: 'open' | 'answered' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      join_requests: {
        Row: {
          id: string
          applicant_name: string
          requested_role: 'instructor' | 'publisher'
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          applicant_name: string
          requested_role: 'instructor' | 'publisher'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          applicant_name?: string
          requested_role?: 'instructor' | 'publisher'
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_session_requests: {
        Row: {
          id: string
          user_id: string | null
          contact_name: string
          contact_phone: string
          message: string
          status: 'pending' | 'contacted' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          contact_name: string
          contact_phone: string
          message: string
          status?: 'pending' | 'contacted' | 'resolved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          contact_name?: string
          contact_phone?: string
          message?: string
          status?: 'pending' | 'contacted' | 'resolved'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_session_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      publishers: {
        Row: {
          id: string
          user_id: string | null
          slug: string
          name: string
          logo_url: string | null
          bio: string
          is_sample: boolean
          status: 'pending' | 'active' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          slug: string
          name: string
          logo_url?: string | null
          bio: string
          is_sample?: boolean
          status?: 'pending' | 'active' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          slug?: string
          name?: string
          logo_url?: string | null
          bio?: string
          is_sample?: boolean
          status?: 'pending' | 'active' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publishers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      portfolio_documents: {
        Row: {
          id: string
          student_id: string
          title: string
          content: string
          status: 'draft' | 'submitted' | 'reviewed'
          instructor_feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          content: string
          status?: 'draft' | 'submitted' | 'reviewed'
          instructor_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          content?: string
          status?: 'draft' | 'submitted' | 'reviewed'
          instructor_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      instructor_payouts: {
        Row: {
          id: string
          instructor_id: string
          period: string
          amount: number
          status: 'pending' | 'paid'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          period: string
          amount: number
          status?: 'pending' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          period?: string
          amount?: number
          status?: 'pending' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructor_payouts_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          }
        ]
      }
      publisher_payouts: {
        Row: {
          id: string
          publisher_id: string
          period: string
          amount: number
          status: 'pending' | 'paid'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          publisher_id: string
          period: string
          amount: number
          status?: 'pending' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          publisher_id?: string
          period?: string
          amount?: number
          status?: 'pending' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publisher_payouts_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          }
        ]
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
