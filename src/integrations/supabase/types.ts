export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          availability_slot_id: string | null
          cancel_message: string | null
          cancel_reason: string | null
          cancelled_by: string | null
          created_at: string
          currency: string
          duration_minutes: number
          end_time: string
          google_event_id: string | null
          google_meet_link: string | null
          id: string
          is_trial: boolean
          lesson_date: string
          lesson_end_at: string | null
          lesson_start_at: string | null
          notes: string | null
          price_amount: number
          reminder_sent_at: string | null
          reschedule_message: string | null
          reschedule_new_slot_id: string | null
          reschedule_reason: string | null
          reschedule_requested_by: string | null
          reschedule_status: string | null
          scheduled_timezone: string
          start_time: string
          status: string
          student_email: string | null
          student_id: string
          student_message: string | null
          student_name: string | null
          subject: string
          tutor_avatar_url: string | null
          tutor_name: string
          tutor_timezone: string
          updated_at: string
        }
        Insert: {
          availability_slot_id?: string | null
          cancel_message?: string | null
          cancel_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          currency?: string
          duration_minutes?: number
          end_time: string
          google_event_id?: string | null
          google_meet_link?: string | null
          id?: string
          is_trial?: boolean
          lesson_date: string
          lesson_end_at?: string | null
          lesson_start_at?: string | null
          notes?: string | null
          price_amount: number
          reminder_sent_at?: string | null
          reschedule_message?: string | null
          reschedule_new_slot_id?: string | null
          reschedule_reason?: string | null
          reschedule_requested_by?: string | null
          reschedule_status?: string | null
          scheduled_timezone?: string
          start_time: string
          status?: string
          student_email?: string | null
          student_id: string
          student_message?: string | null
          student_name?: string | null
          subject: string
          tutor_avatar_url?: string | null
          tutor_name: string
          tutor_timezone?: string
          updated_at?: string
        }
        Update: {
          availability_slot_id?: string | null
          cancel_message?: string | null
          cancel_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          currency?: string
          duration_minutes?: number
          end_time?: string
          google_event_id?: string | null
          google_meet_link?: string | null
          id?: string
          is_trial?: boolean
          lesson_date?: string
          lesson_end_at?: string | null
          lesson_start_at?: string | null
          notes?: string | null
          price_amount?: number
          reminder_sent_at?: string | null
          reschedule_message?: string | null
          reschedule_new_slot_id?: string | null
          reschedule_reason?: string | null
          reschedule_requested_by?: string | null
          reschedule_status?: string | null
          scheduled_timezone?: string
          start_time?: string
          status?: string
          student_email?: string | null
          student_id?: string
          student_message?: string | null
          student_name?: string | null
          subject?: string
          tutor_avatar_url?: string | null
          tutor_name?: string
          tutor_timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_availability_slot_id_fkey"
            columns: ["availability_slot_id"]
            isOneToOne: false
            referencedRelation: "tutor_availability_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_reschedule_new_slot_id_fkey"
            columns: ["reschedule_new_slot_id"]
            isOneToOne: false
            referencedRelation: "tutor_availability_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      business_inquiries: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string | null
          phone: string | null
          team_size: string | null
          timezone: string | null
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          phone?: string | null
          team_size?: string | null
          timezone?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          phone?: string | null
          team_size?: string | null
          timezone?: string | null
        }
        Relationships: []
      }
      conversation_partner_applications: {
        Row: {
          agreed_to_terms: boolean
          conversation_style: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          id_document_url: string | null
          last_name: string
          motivation: string
          phone: string | null
          status: string
          timezone: string | null
          updated_at: string
          video_intro_url: string | null
        }
        Insert: {
          agreed_to_terms?: boolean
          conversation_style?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          id_document_url?: string | null
          last_name: string
          motivation: string
          phone?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
          video_intro_url?: string | null
        }
        Update: {
          agreed_to_terms?: boolean
          conversation_style?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          id_document_url?: string | null
          last_name?: string
          motivation?: string
          phone?: string | null
          status?: string
          timezone?: string | null
          updated_at?: string
          video_intro_url?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      lesson_plans: {
        Row: {
          created_at: string
          duration: string
          id: string
          language: string
          learning_goals: string | null
          num_students: string
          plan_content: string
          plan_title: string | null
          student_level: string
          subject: string
          tutor_id: string
          weak_points: string | null
        }
        Insert: {
          created_at?: string
          duration: string
          id?: string
          language?: string
          learning_goals?: string | null
          num_students: string
          plan_content: string
          plan_title?: string | null
          student_level: string
          subject: string
          tutor_id: string
          weak_points?: string | null
        }
        Update: {
          created_at?: string
          duration?: string
          id?: string
          language?: string
          learning_goals?: string | null
          num_students?: string
          plan_content?: string
          plan_title?: string | null
          student_level?: string
          subject?: string
          tutor_id?: string
          weak_points?: string | null
        }
        Relationships: []
      }
      message_conversations: {
        Row: {
          archived_by_student: boolean
          archived_by_tutor: boolean
          created_at: string
          deleted_by_student: boolean
          deleted_by_tutor: boolean
          id: string
          student_id: string
          tutor_name: string
          updated_at: string
        }
        Insert: {
          archived_by_student?: boolean
          archived_by_tutor?: boolean
          created_at?: string
          deleted_by_student?: boolean
          deleted_by_tutor?: boolean
          id?: string
          student_id: string
          tutor_name: string
          updated_at?: string
        }
        Update: {
          archived_by_student?: boolean
          archived_by_tutor?: boolean
          created_at?: string
          deleted_by_student?: boolean
          deleted_by_tutor?: boolean
          id?: string
          student_id?: string
          tutor_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_display_name: string | null
          sender_id: string
          sender_type: string
          student_id: string
          tutor_name: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_display_name?: string | null
          sender_id: string
          sender_type: string
          student_id: string
          tutor_name: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_display_name?: string | null
          sender_id?: string
          sender_type?: string
          student_id?: string
          tutor_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_surveys: boolean
          email_tips_discount: boolean
          email_transactional: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_surveys?: boolean
          email_tips_discount?: boolean
          email_transactional?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_surveys?: boolean
          email_tips_discount?: boolean
          email_transactional?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_details: string
          payment_method: string
          processed_at: string | null
          status: string
          tutor_name: string
          tutor_user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_details: string
          payment_method?: string
          processed_at?: string | null
          status?: string
          tutor_name: string
          tutor_user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_details?: string
          payment_method?: string
          processed_at?: string | null
          status?: string
          tutor_name?: string
          tutor_user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          hourly_rate: number | null
          id: string
          is_suspended: boolean
          meet_link: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          hourly_rate?: number | null
          id: string
          is_suspended?: boolean
          meet_link?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_suspended?: boolean
          meet_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_partner_profiles: {
        Row: {
          application_id: string | null
          availability: string | null
          avatar_url: string | null
          bio: string
          country: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_archived: boolean
          is_published: boolean
          languages_spoken: string[]
          last_name: string
          native_language: string | null
          other_languages: string | null
          price_per_session: number
          rating: number
          review_count: number
          source: string
          timezone: string | null
          topics: string[]
          updated_at: string
          video_intro_url: string | null
        }
        Insert: {
          application_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string
          country?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_archived?: boolean
          is_published?: boolean
          languages_spoken?: string[]
          last_name: string
          native_language?: string | null
          other_languages?: string | null
          price_per_session?: number
          rating?: number
          review_count?: number
          source?: string
          timezone?: string | null
          topics?: string[]
          updated_at?: string
          video_intro_url?: string | null
        }
        Update: {
          application_id?: string | null
          availability?: string | null
          avatar_url?: string | null
          bio?: string
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_archived?: boolean
          is_published?: boolean
          languages_spoken?: string[]
          last_name?: string
          native_language?: string | null
          other_languages?: string | null
          price_per_session?: number
          rating?: number
          review_count?: number
          source?: string
          timezone?: string | null
          topics?: string[]
          updated_at?: string
          video_intro_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_partner_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "conversation_partner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      public_tutor_profiles: {
        Row: {
          application_id: string | null
          avatar_url: string | null
          bio: string
          certifications: string | null
          country: string | null
          created_at: string
          education: string | null
          email: string | null
          experience: string
          first_name: string
          hourly_rate: number
          id: string
          is_archived: boolean
          is_published: boolean
          languages_spoken: string[]
          last_name: string
          native_language: string | null
          other_languages: string | null
          primary_subject: string
          rating: number
          review_count: number
          source: string
          subjects: string[]
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          avatar_url?: string | null
          bio: string
          certifications?: string | null
          country?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          experience: string
          first_name: string
          hourly_rate: number
          id?: string
          is_archived?: boolean
          is_published?: boolean
          languages_spoken?: string[]
          last_name: string
          native_language?: string | null
          other_languages?: string | null
          primary_subject: string
          rating?: number
          review_count?: number
          source?: string
          subjects?: string[]
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          avatar_url?: string | null
          bio?: string
          certifications?: string | null
          country?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          experience?: string
          first_name?: string
          hourly_rate?: number
          id?: string
          is_archived?: boolean
          is_published?: boolean
          languages_spoken?: string[]
          last_name?: string
          native_language?: string | null
          other_languages?: string | null
          primary_subject?: string
          rating?: number
          review_count?: number
          source?: string
          subjects?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_tutor_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "tutor_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          student_id: string
          tutor_name: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          student_id: string
          tutor_name: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          student_id?: string
          tutor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_emails: {
        Row: {
          application_type: string
          body_preview: string | null
          id: string
          recipient_email: string
          sent_at: string
          subject: string
        }
        Insert: {
          application_type: string
          body_preview?: string | null
          id?: string
          recipient_email: string
          sent_at?: string
          subject: string
        }
        Update: {
          application_type?: string
          body_preview?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string
          subject?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tutor_applications: {
        Row: {
          about_teaching: string | null
          availability: string
          bio: string
          certifications: string | null
          country: string | null
          created_at: string
          education: string | null
          email: string
          experience: string
          first_name: string
          hourly_rate: number
          id: string
          id_document_url: string | null
          last_name: string
          native_language: string | null
          other_languages: string | null
          phone: string | null
          status: string
          subjects: string[]
          timezone: string | null
        }
        Insert: {
          about_teaching?: string | null
          availability: string
          bio: string
          certifications?: string | null
          country?: string | null
          created_at?: string
          education?: string | null
          email: string
          experience: string
          first_name: string
          hourly_rate: number
          id?: string
          id_document_url?: string | null
          last_name: string
          native_language?: string | null
          other_languages?: string | null
          phone?: string | null
          status?: string
          subjects?: string[]
          timezone?: string | null
        }
        Update: {
          about_teaching?: string | null
          availability?: string
          bio?: string
          certifications?: string | null
          country?: string | null
          created_at?: string
          education?: string | null
          email?: string
          experience?: string
          first_name?: string
          hourly_rate?: number
          id?: string
          id_document_url?: string | null
          last_name?: string
          native_language?: string | null
          other_languages?: string | null
          phone?: string | null
          status?: string
          subjects?: string[]
          timezone?: string | null
        }
        Relationships: []
      }
      tutor_availability_slots: {
        Row: {
          availability_status: string
          booked_at: string | null
          created_at: string
          id: string
          slot_end_at: string
          slot_start_at: string
          tutor_name: string
          tutor_timezone: string
          updated_at: string
        }
        Insert: {
          availability_status?: string
          booked_at?: string | null
          created_at?: string
          id?: string
          slot_end_at: string
          slot_start_at: string
          tutor_name: string
          tutor_timezone?: string
          updated_at?: string
        }
        Update: {
          availability_status?: string
          booked_at?: string | null
          created_at?: string
          id?: string
          slot_end_at?: string
          slot_start_at?: string
          tutor_name?: string
          tutor_timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutor_earnings: {
        Row: {
          booking_id: string
          commission_amount: number
          commission_rate: number
          created_at: string
          duration_minutes: number
          gross_amount: number
          id: string
          is_trial: boolean
          lesson_date: string
          lesson_start_at: string | null
          net_amount: number
          payout_status: string
          student_name: string | null
          subject: string
          tutor_name: string
        }
        Insert: {
          booking_id: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          duration_minutes?: number
          gross_amount?: number
          id?: string
          is_trial?: boolean
          lesson_date: string
          lesson_start_at?: string | null
          net_amount?: number
          payout_status?: string
          student_name?: string | null
          subject: string
          tutor_name: string
        }
        Update: {
          booking_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          duration_minutes?: number
          gross_amount?: number
          id?: string
          is_trial?: boolean
          lesson_date?: string
          lesson_start_at?: string | null
          net_amount?: number
          payout_status?: string
          student_name?: string | null
          subject?: string
          tutor_name?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          preferred_currency: string
          preferred_language: string
          preferred_timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          preferred_currency?: string
          preferred_language?: string
          preferred_timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          preferred_currency?: string
          preferred_language?: string
          preferred_timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_tutor_profile: {
        Args: {
          _avatar_url?: string
          _bio?: string
          _certifications?: string
          _country?: string
          _education?: string
          _email: string
          _experience: string
          _first_name: string
          _hourly_rate: number
          _last_name: string
          _native_language?: string
          _other_languages?: string
          _primary_subject: string
          _rating?: number
          _review_count?: number
          _subjects: string[]
        }
        Returns: {
          application_id: string | null
          avatar_url: string | null
          bio: string
          certifications: string | null
          country: string | null
          created_at: string
          education: string | null
          email: string | null
          experience: string
          first_name: string
          hourly_rate: number
          id: string
          is_archived: boolean
          is_published: boolean
          languages_spoken: string[]
          last_name: string
          native_language: string | null
          other_languages: string | null
          primary_subject: string
          rating: number
          review_count: number
          source: string
          subjects: string[]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "public_tutor_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_partner_application: {
        Args: { _application_id: string }
        Returns: {
          agreed_to_terms: boolean
          conversation_style: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          id_document_url: string | null
          last_name: string
          motivation: string
          phone: string | null
          status: string
          timezone: string | null
          updated_at: string
          video_intro_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "conversation_partner_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_tutor_application: {
        Args: { _application_id: string }
        Returns: {
          about_teaching: string | null
          availability: string
          bio: string
          certifications: string | null
          country: string | null
          created_at: string
          education: string | null
          email: string
          experience: string
          first_name: string
          hourly_rate: number
          id: string
          id_document_url: string | null
          last_name: string
          native_language: string | null
          other_languages: string | null
          phone: string | null
          status: string
          subjects: string[]
          timezone: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tutor_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      book_tutor_availability_slot: {
        Args: {
          _currency?: string
          _price_amount: number
          _scheduled_timezone: string
          _slot_id: string
          _student_email: string
          _student_message: string
          _student_name: string
          _subject: string
        }
        Returns: {
          availability_slot_id: string | null
          cancel_message: string | null
          cancel_reason: string | null
          cancelled_by: string | null
          created_at: string
          currency: string
          duration_minutes: number
          end_time: string
          google_event_id: string | null
          google_meet_link: string | null
          id: string
          is_trial: boolean
          lesson_date: string
          lesson_end_at: string | null
          lesson_start_at: string | null
          notes: string | null
          price_amount: number
          reminder_sent_at: string | null
          reschedule_message: string | null
          reschedule_new_slot_id: string | null
          reschedule_reason: string | null
          reschedule_requested_by: string | null
          reschedule_status: string | null
          scheduled_timezone: string
          start_time: string
          status: string
          student_email: string | null
          student_id: string
          student_message: string | null
          student_name: string | null
          subject: string
          tutor_avatar_url: string | null
          tutor_name: string
          tutor_timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_my_partner_profile: {
        Args: never
        Returns: {
          application_id: string | null
          availability: string | null
          avatar_url: string | null
          bio: string
          country: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_archived: boolean
          is_published: boolean
          languages_spoken: string[]
          last_name: string
          native_language: string | null
          other_languages: string | null
          price_per_session: number
          rating: number
          review_count: number
          source: string
          timezone: string | null
          topics: string[]
          updated_at: string
          video_intro_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "public_partner_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_my_tutor_profile: {
        Args: never
        Returns: {
          application_id: string | null
          avatar_url: string | null
          bio: string
          certifications: string | null
          country: string | null
          created_at: string
          education: string | null
          email: string | null
          experience: string
          first_name: string
          hourly_rate: number
          id: string
          is_archived: boolean
          is_published: boolean
          languages_spoken: string[]
          last_name: string
          native_language: string | null
          other_languages: string | null
          primary_subject: string
          rating: number
          review_count: number
          source: string
          subjects: string[]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "public_tutor_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      reject_partner_application: {
        Args: { _application_id: string }
        Returns: {
          agreed_to_terms: boolean
          conversation_style: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          id_document_url: string | null
          last_name: string
          motivation: string
          phone: string | null
          status: string
          timezone: string | null
          updated_at: string
          video_intro_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "conversation_partner_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_tutor_application: {
        Args: { _application_id: string }
        Returns: {
          about_teaching: string | null
          availability: string
          bio: string
          certifications: string | null
          country: string | null
          created_at: string
          education: string | null
          email: string
          experience: string
          first_name: string
          hourly_rate: number
          id: string
          id_document_url: string | null
          last_name: string
          native_language: string | null
          other_languages: string | null
          phone: string | null
          status: string
          subjects: string[]
          timezone: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tutor_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_my_partner_profile: {
        Args: {
          _availability?: string
          _avatar_url?: string
          _bio: string
          _country?: string
          _native_language?: string
          _other_languages?: string
          _price_per_session: number
          _timezone?: string
          _topics?: string[]
          _video_intro_url?: string
        }
        Returns: {
          application_id: string | null
          availability: string | null
          avatar_url: string | null
          bio: string
          country: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_archived: boolean
          is_published: boolean
          languages_spoken: string[]
          last_name: string
          native_language: string | null
          other_languages: string | null
          price_per_session: number
          rating: number
          review_count: number
          source: string
          timezone: string | null
          topics: string[]
          updated_at: string
          video_intro_url: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "public_partner_profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      save_my_tutor_profile:
        | {
            Args: {
              _avatar_url?: string
              _bio: string
              _certifications?: string
              _country?: string
              _education?: string
              _experience: string
              _hourly_rate: number
              _native_language?: string
              _other_languages?: string
            }
            Returns: {
              application_id: string | null
              avatar_url: string | null
              bio: string
              certifications: string | null
              country: string | null
              created_at: string
              education: string | null
              email: string | null
              experience: string
              first_name: string
              hourly_rate: number
              id: string
              is_archived: boolean
              is_published: boolean
              languages_spoken: string[]
              last_name: string
              native_language: string | null
              other_languages: string | null
              primary_subject: string
              rating: number
              review_count: number
              source: string
              subjects: string[]
              updated_at: string
            }
            SetofOptions: {
              from: "*"
              to: "public_tutor_profiles"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              _about_teaching?: string
              _availability?: string
              _avatar_url?: string
              _bio: string
              _certifications?: string
              _country?: string
              _education?: string
              _experience: string
              _hourly_rate: number
              _native_language?: string
              _other_languages?: string
              _phone?: string
              _subjects?: string[]
              _timezone?: string
            }
            Returns: {
              application_id: string | null
              avatar_url: string | null
              bio: string
              certifications: string | null
              country: string | null
              created_at: string
              education: string | null
              email: string | null
              experience: string
              first_name: string
              hourly_rate: number
              id: string
              is_archived: boolean
              is_published: boolean
              languages_spoken: string[]
              last_name: string
              native_language: string | null
              other_languages: string | null
              primary_subject: string
              rating: number
              review_count: number
              source: string
              subjects: string[]
              updated_at: string
            }[]
            SetofOptions: {
              from: "*"
              to: "public_tutor_profiles"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      sync_public_tutor_profile_from_application: {
        Args: { _application_id: string }
        Returns: {
          application_id: string | null
          avatar_url: string | null
          bio: string
          certifications: string | null
          country: string | null
          created_at: string
          education: string | null
          email: string | null
          experience: string
          first_name: string
          hourly_rate: number
          id: string
          is_archived: boolean
          is_published: boolean
          languages_spoken: string[]
          last_name: string
          native_language: string | null
          other_languages: string | null
          primary_subject: string
          rating: number
          review_count: number
          source: string
          subjects: string[]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "public_tutor_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      tutor_complete_booking: {
        Args: { _booking_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "tutor" | "convo_partner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "tutor", "convo_partner"],
    },
  },
} as const
