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
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          hourly_rate?: number | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          hourly_rate?: number | null
          id?: string
          updated_at?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      app_role: "admin" | "moderator" | "user" | "tutor"
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
      app_role: ["admin", "moderator", "user", "tutor"],
    },
  },
} as const
