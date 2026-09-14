export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Generated from the live Supabase database (project xxptugdbtzkjyydveprp)
 * on 14 September 2026, read directly from information_schema and pg_enum.
 *
 * Do NOT hand-edit. Regenerate whenever the schema changes. A stale version of
 * this file is what previously allowed code to be written against columns that
 * did not exist (child_profiles.name / .age), which shipped broken to production.
 */
export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          actor_profile_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_profile_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_profile_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          metadata?: Json | null
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
      bookings: {
        Row: {
          id: string
          dependent_participant_id: string | null
          independent_participant_id: string | null
          package_id: string
          instructor_id: string | null
          course_subscription_id: string | null
          status: Database["public"]["Enums"]["booking_status_enum"]
          scheduled_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dependent_participant_id?: string | null
          independent_participant_id?: string | null
          package_id: string
          instructor_id?: string | null
          course_subscription_id?: string | null
          status?: Database["public"]["Enums"]["booking_status_enum"]
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
          status?: Database["public"]["Enums"]["booking_status_enum"]
          scheduled_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      box_subscription_plans: {
        Row: {
          id: string
          name: string
          price_total: number
          price_monthly: number
          duration_months: number
          savings_note: string | null
        }
        Insert: {
          id?: string
          name: string
          price_total: number
          price_monthly: number
          duration_months: number
          savings_note?: string | null
        }
        Update: {
          id?: string
          name?: string
          price_total?: number
          price_monthly?: number
          duration_months?: number
          savings_note?: string | null
        }
        Relationships: []
      }
      box_subscriptions: {
        Row: {
          id: string
          user_id: string | null
          customer_name: string
          plan_name: string
          status: Database["public"]["Enums"]["sub_status_enum"]
          next_shipment_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer_name: string
          plan_name: string
          status?: Database["public"]["Enums"]["sub_status_enum"]
          next_shipment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          customer_name?: string
          plan_name?: string
          status?: Database["public"]["Enums"]["sub_status_enum"]
          next_shipment_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      child_profiles: {
        Row: {
          id: string
          user_profile_id: string
          full_name: string
          birth_date: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_profile_id: string
          full_name: string
          birth_date?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_profile_id?: string
          full_name?: string
          birth_date?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      course_subscriptions: {
        Row: {
          id: string
          package_id: string
          user_id: string
          participant_type: string
          child_id: string | null
          status: string
          started_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          package_id: string
          user_id: string
          participant_type: string
          child_id?: string | null
          status?: string
          started_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          package_id?: string
          user_id?: string
          participant_type?: string
          child_id?: string | null
          status?: string
          started_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      creative_writing_packages: {
        Row: {
          id: string
          slug: string
          name: string
          age_group: Database["public"]["Enums"]["age_group"]
          price: number
          duration_text: string | null
          sessions_count: number | null
          session_duration: string | null
          target_audience: string | null
          prerequisite_note: string | null
          prerequisite_package_id: string | null
          short_description: string | null
          full_description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          age_group: Database["public"]["Enums"]["age_group"]
          price: number
          duration_text?: string | null
          sessions_count?: number | null
          session_duration?: string | null
          target_audience?: string | null
          prerequisite_note?: string | null
          prerequisite_package_id?: string | null
          short_description?: string | null
          full_description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          age_group?: Database["public"]["Enums"]["age_group"]
          price?: number
          duration_text?: string | null
          sessions_count?: number | null
          session_duration?: string | null
          target_audience?: string | null
          prerequisite_note?: string | null
          prerequisite_package_id?: string | null
          short_description?: string | null
          full_description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      instructor_certifications: {
        Row: {
          id: string
          instructor_id: string
          training_completed_at: string | null
          training_meeting_link: string | null
          exam_passed: boolean
          exam_score: number | null
          certified_at: string | null
        }
        Insert: {
          id?: string
          instructor_id: string
          training_completed_at?: string | null
          training_meeting_link?: string | null
          exam_passed?: boolean
          exam_score?: number | null
          certified_at?: string | null
        }
        Update: {
          id?: string
          instructor_id?: string
          training_completed_at?: string | null
          training_meeting_link?: string | null
          exam_passed?: boolean
          exam_score?: number | null
          certified_at?: string | null
        }
        Relationships: []
      }
      instructor_compensation_profiles: {
        Row: {
          id: string
          instructor_id: string
          billing_model: Database["public"]["Enums"]["compensation_billing_model"]
          selected_pricing_option_id: string | null
          monthly_minimum_hours: number | null
          overtime_rate_per_hour: number | null
          approval_status: Database["public"]["Enums"]["compensation_approval_status"]
          admin_notes: string | null
          reviewed_by_profile_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          billing_model: Database["public"]["Enums"]["compensation_billing_model"]
          selected_pricing_option_id?: string | null
          monthly_minimum_hours?: number | null
          overtime_rate_per_hour?: number | null
          approval_status?: Database["public"]["Enums"]["compensation_approval_status"]
          admin_notes?: string | null
          reviewed_by_profile_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          billing_model?: Database["public"]["Enums"]["compensation_billing_model"]
          selected_pricing_option_id?: string | null
          monthly_minimum_hours?: number | null
          overtime_rate_per_hour?: number | null
          approval_status?: Database["public"]["Enums"]["compensation_approval_status"]
          admin_notes?: string | null
          reviewed_by_profile_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      instructor_payouts: {
        Row: {
          id: string
          instructor_id: string
          period: string
          amount: number
          status: Database["public"]["Enums"]["payout_status_enum"]
          created_at: string
          updated_at: string
          source_type: string | null
          source_id: string | null
          description: string | null
        }
        Insert: {
          id?: string
          instructor_id: string
          period: string
          amount: number
          status?: Database["public"]["Enums"]["payout_status_enum"]
          created_at?: string
          updated_at?: string
          source_type?: string | null
          source_id?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          instructor_id?: string
          period?: string
          amount?: number
          status?: Database["public"]["Enums"]["payout_status_enum"]
          created_at?: string
          updated_at?: string
          source_type?: string | null
          source_id?: string | null
          description?: string | null
        }
        Relationships: []
      }
      instructor_pricing_options: {
        Row: {
          id: string
          label: string
          base_price_per_session: number
          is_active: boolean
        }
        Insert: {
          id?: string
          label: string
          base_price_per_session: number
          is_active?: boolean
        }
        Update: {
          id?: string
          label?: string
          base_price_per_session?: number
          is_active?: boolean
        }
        Relationships: []
      }
      instructor_services: {
        Row: {
          id: string
          instructor_id: string
          service_id: string
          requested_price: number | null
          approved_price: number | null
          status: string
          is_active: boolean
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          service_id: string
          requested_price?: number | null
          approved_price?: number | null
          status?: string
          is_active?: boolean
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          service_id?: string
          requested_price?: number | null
          approved_price?: number | null
          status?: string
          is_active?: boolean
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      instructor_weekly_slots: {
        Row: {
          id: string
          instructor_id: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          time: string
          is_booked: boolean
          commitment_type: Database["public"]["Enums"]["commitment_type"] | null
          commitment_months: number | null
          commitment_ends_at: string | null
          is_pending_change: boolean
        }
        Insert: {
          id?: string
          instructor_id: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          time: string
          is_booked?: boolean
          commitment_type?: Database["public"]["Enums"]["commitment_type"] | null
          commitment_months?: number | null
          commitment_ends_at?: string | null
          is_pending_change?: boolean
        }
        Update: {
          id?: string
          instructor_id?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          time?: string
          is_booked?: boolean
          commitment_type?: Database["public"]["Enums"]["commitment_type"] | null
          commitment_months?: number | null
          commitment_ends_at?: string | null
          is_pending_change?: boolean
        }
        Relationships: []
      }
      instructors: {
        Row: {
          id: string
          user_id: string
          display_name: string
          bio: string
          specialties: string[]
          years_experience: number
          is_sample: boolean | null
          status: Database["public"]["Enums"]["instructor_status_enum"]
          training_passed: boolean | null
          work_model: Database["public"]["Enums"]["work_model_enum"]
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
          id?: string
          user_id: string
          display_name: string
          bio: string
          specialties: string[]
          years_experience: number
          is_sample?: boolean | null
          status?: Database["public"]["Enums"]["instructor_status_enum"]
          training_passed?: boolean | null
          work_model?: Database["public"]["Enums"]["work_model_enum"]
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
          is_sample?: boolean | null
          status?: Database["public"]["Enums"]["instructor_status_enum"]
          training_passed?: boolean | null
          work_model?: Database["public"]["Enums"]["work_model_enum"]
          requested_price?: number | null
          selected_pricing_option_id?: string | null
          approved_price?: number | null
          weekly_schedule?: Json | null
          pending_schedule?: Json | null
          monthly_hours_committed?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      join_requests: {
        Row: {
          id: string
          applicant_name: string
          requested_role: string
          status: Database["public"]["Enums"]["join_request_status_enum"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          applicant_name: string
          requested_role: string
          status?: Database["public"]["Enums"]["join_request_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          applicant_name?: string
          requested_role?: string
          status?: Database["public"]["Enums"]["join_request_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          recipient_profile_id: string
          title: string
          message: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_profile_id: string
          title: string
          message?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_profile_id?: string
          title?: string
          message?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          dependent_participant_id: string | null
          independent_participant_id: string | null
          total_amount: number
          status: Database["public"]["Enums"]["order_status_enum"]
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
          status?: Database["public"]["Enums"]["order_status_enum"]
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
          status?: Database["public"]["Enums"]["order_status_enum"]
          transaction_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      personalized_products: {
        Row: {
          id: string
          slug: string
          name: string
          category: Database["public"]["Enums"]["product_category"]
          price: number
          electronic_price: number | null
          short_description: string | null
          cover_image_url: string | null
          publisher_id: string | null
          owner_type: Database["public"]["Enums"]["owner_type"]
          features: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          category: Database["public"]["Enums"]["product_category"]
          price: number
          electronic_price?: number | null
          short_description?: string | null
          cover_image_url?: string | null
          publisher_id?: string | null
          owner_type?: Database["public"]["Enums"]["owner_type"]
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          category?: Database["public"]["Enums"]["product_category"]
          price?: number
          electronic_price?: number | null
          short_description?: string | null
          cover_image_url?: string | null
          publisher_id?: string | null
          owner_type?: Database["public"]["Enums"]["owner_type"]
          features?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_documents: {
        Row: {
          id: string
          student_id: string
          title: string
          content: string
          status: Database["public"]["Enums"]["document_status_enum"]
          instructor_feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          content: string
          status?: Database["public"]["Enums"]["document_status_enum"]
          instructor_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          content?: string
          status?: Database["public"]["Enums"]["document_status_enum"]
          instructor_feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_formula_settings: {
        Row: {
          id: string
          platform_multiplier: number
          fixed_admin_fee: number
          updated_at: string
        }
        Insert: {
          id?: string
          platform_multiplier?: number
          fixed_admin_fee?: number
          updated_at?: string
        }
        Update: {
          id?: string
          platform_multiplier?: number
          fixed_admin_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      profile_update_requests: {
        Row: {
          id: string
          instructor_id: string
          requested_changes: Json
          status: Database["public"]["Enums"]["update_request_status"]
          admin_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          requested_changes: Json
          status?: Database["public"]["Enums"]["update_request_status"]
          admin_feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          requested_changes?: Json
          status?: Database["public"]["Enums"]["update_request_status"]
          admin_feedback?: string | null
          created_at?: string
        }
        Relationships: []
      }
      publisher_payouts: {
        Row: {
          id: string
          publisher_id: string
          period: string
          amount: number
          status: Database["public"]["Enums"]["payout_status_enum"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          publisher_id: string
          period: string
          amount: number
          status?: Database["public"]["Enums"]["payout_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          publisher_id?: string
          period?: string
          amount?: number
          status?: Database["public"]["Enums"]["payout_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      publishers: {
        Row: {
          id: string
          user_id: string | null
          slug: string
          name: string
          logo_url: string | null
          bio: string
          is_sample: boolean | null
          status: Database["public"]["Enums"]["publisher_status_enum"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          slug: string
          name: string
          logo_url?: string | null
          bio: string
          is_sample?: boolean | null
          status?: Database["public"]["Enums"]["publisher_status_enum"]
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
          is_sample?: boolean | null
          status?: Database["public"]["Enums"]["publisher_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          dependent_participant_id: string | null
          independent_participant_id: string | null
          instructor_id: string
          rating: number
          comment: string | null
          booking_id: string | null
          created_at: string
          reviewer_profile_id: string | null
          service_order_id: string | null
          standalone_service_id: string | null
          service_rating: number | null
          is_hidden: boolean
          hidden_reason: string | null
        }
        Insert: {
          id?: string
          dependent_participant_id?: string | null
          independent_participant_id?: string | null
          instructor_id: string
          rating: number
          comment?: string | null
          booking_id?: string | null
          created_at?: string
          reviewer_profile_id?: string | null
          service_order_id?: string | null
          standalone_service_id?: string | null
          service_rating?: number | null
          is_hidden?: boolean
          hidden_reason?: string | null
        }
        Update: {
          id?: string
          dependent_participant_id?: string | null
          independent_participant_id?: string | null
          instructor_id?: string
          rating?: number
          comment?: string | null
          booking_id?: string | null
          created_at?: string
          reviewer_profile_id?: string | null
          service_order_id?: string | null
          standalone_service_id?: string | null
          service_rating?: number | null
          is_hidden?: boolean
          hidden_reason?: string | null
        }
        Relationships: []
      }
      service_order_messages: {
        Row: {
          id: string
          order_id: string
          sender_profile_id: string
          body: string
          is_delivery: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          sender_profile_id: string
          body: string
          is_delivery?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          sender_profile_id?: string
          body?: string
          is_delivery?: boolean
          created_at?: string
        }
        Relationships: []
      }
      service_orders: {
        Row: {
          id: string
          buyer_profile_id: string
          package_id: string | null
          standalone_service_id: string | null
          status: Database["public"]["Enums"]["service_order_status"]
          amount: number
          transaction_reference: string | null
          created_at: string
          instructor_id: string | null
          delivered_at: string | null
          completed_at: string | null
          instructor_earning: number | null
        }
        Insert: {
          id?: string
          buyer_profile_id: string
          package_id?: string | null
          standalone_service_id?: string | null
          status?: Database["public"]["Enums"]["service_order_status"]
          amount: number
          transaction_reference?: string | null
          created_at?: string
          instructor_id?: string | null
          delivered_at?: string | null
          completed_at?: string | null
          instructor_earning?: number | null
        }
        Update: {
          id?: string
          buyer_profile_id?: string
          package_id?: string | null
          standalone_service_id?: string | null
          status?: Database["public"]["Enums"]["service_order_status"]
          amount?: number
          transaction_reference?: string | null
          created_at?: string
          instructor_id?: string | null
          delivered_at?: string | null
          completed_at?: string | null
          instructor_earning?: number | null
        }
        Relationships: []
      }
      session_attachments: {
        Row: {
          id: string
          booking_id: string
          file_name: string
          file_url: string
        }
        Insert: {
          id?: string
          booking_id: string
          file_name: string
          file_url: string
        }
        Update: {
          id?: string
          booking_id?: string
          file_name?: string
          file_url?: string
        }
        Relationships: []
      }
      session_messages: {
        Row: {
          id: string
          booking_id: string
          sender_profile_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          sender_profile_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          sender_profile_id?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          course_subscription_id: string
          instructor_id: string | null
          session_number: number
          scheduled_at: string
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          course_subscription_id: string
          instructor_id?: string | null
          session_number: number
          scheduled_at: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          course_subscription_id?: string
          instructor_id?: string | null
          session_number?: number
          scheduled_at?: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      standalone_services: {
        Row: {
          id: string
          name: string
          price: number
          description: string | null
          category: string | null
          sort_order: number | null
          price_type: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          description?: string | null
          category?: string | null
          sort_order?: number | null
          price_type?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          description?: string | null
          category?: string | null
          sort_order?: number | null
          price_type?: string
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          id: string
          title: string
          description: string | null
          package_id: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          package_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          package_id?: string | null
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
          status: Database["public"]["Enums"]["support_session_status_enum"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          contact_name: string
          contact_phone: string
          message: string
          status?: Database["public"]["Enums"]["support_session_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          contact_name?: string
          contact_phone?: string
          message?: string
          status?: Database["public"]["Enums"]["support_session_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_profile_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_profile_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_profile_id?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string | null
          requester_name: string
          subject: string
          category: string
          status: Database["public"]["Enums"]["ticket_status_enum"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          requester_name: string
          subject: string
          category: string
          status?: Database["public"]["Enums"]["ticket_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          requester_name?: string
          subject?: string
          category?: string
          status?: Database["public"]["Enums"]["ticket_status_enum"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
      user_profiles: {
        Row: {
          id: string
          full_name: string
          role: Database["public"]["Enums"]["user_role_enum"]
          is_guardian: boolean | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          is_guardian?: boolean | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          is_guardian?: boolean | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          id: string
          instructor_id: string
          amount: number
          method: string
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          amount: number
          method: string
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          amount?: number
          method?: string
          status?: string
          admin_notes?: string | null
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_instructor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      age_group: "under_12" | "12_plus"
      age_group_enum: "under_12" | "12_plus"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      booking_status_enum: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled"
      box_subscription_status: "active" | "paused" | "cancelled"
      commitment_type: "ongoing" | "fixed_term"
      compensation_approval_status: "proposed" | "under_discussion" | "approved" | "rejected"
      compensation_billing_model: "monthly" | "per_session"
      course_subscription_status: "active" | "completed" | "cancelled"
      day_of_week: "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
      document_status_enum: "draft" | "submitted" | "reviewed"
      instructor_status: "pending_training" | "pending_approval" | "active" | "suspended"
      instructor_status_enum: "pending_training" | "pending_approval" | "active" | "suspended"
      join_request_status: "pending" | "approved" | "rejected"
      join_request_status_enum: "pending" | "approved" | "rejected"
      order_status: "pending" | "awaiting_verification" | "paid" | "failed" | "refunded"
      order_status_enum: "pending" | "awaiting_verification" | "paid" | "failed" | "refunded"
      owner_type: "platform" | "publisher"
      payout_status: "pending" | "paid"
      payout_status_enum: "pending" | "paid"
      portfolio_status: "draft" | "submitted" | "reviewed"
      product_category: "library" | "custom" | "subscription"
      product_owner_type: "platform" | "publisher"
      publisher_status: "pending" | "active" | "suspended"
      publisher_status_enum: "pending" | "active" | "suspended"
      requested_role: "instructor" | "publisher"
      service_order_status: "pending" | "awaiting_verification" | "paid" | "refunded" | "in_progress" | "delivered" | "completed" | "cancelled"
      session_request_status: "pending" | "contacted" | "closed"
      sub_status_enum: "active" | "cancelled" | "paused"
      support_session_status_enum: "pending" | "contacted" | "resolved"
      ticket_status: "open" | "answered" | "closed"
      ticket_status_enum: "open" | "answered" | "closed"
      update_request_status: "pending" | "approved" | "rejected"
      user_role: "visitor" | "customer" | "student" | "instructor" | "publisher" | "general_supervisor" | "super_admin"
      user_role_enum: "visitor" | "customer" | "student" | "instructor" | "publisher" | "general_supervisor" | "super_admin"
      work_model: "per_session" | "monthly"
      work_model_enum: "per_session" | "monthly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
