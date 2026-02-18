export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Subscription status enum
export type SubscriptionStatus = 'pending' | 'active' | 'inactive' | 'expired' | 'cancelled';

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_keys: {
        Row: {
          access_key: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          used_at: string | null
        }
        Insert: {
          access_key: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          used_at?: string | null
        }
        Update: {
          access_key?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          used_at?: string | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      clinical_cases: {
        Row: {
          correct_diagnosis: string
          correct_exams: string[]
          correct_treatment: string
          created_at: string
          difficulty: string
          id: string
          patient_info: Json
          specialty: string | null
          symptoms: string[]
          title: string
          user_id: string
        }
        Insert: {
          correct_diagnosis: string
          correct_exams?: string[]
          correct_treatment: string
          created_at?: string
          difficulty?: string
          id?: string
          patient_info?: Json
          specialty?: string | null
          symptoms?: string[]
          title: string
          user_id: string
        }
        Update: {
          correct_diagnosis?: string
          correct_exams?: string[]
          correct_treatment?: string
          created_at?: string
          difficulty?: string
          id?: string
          patient_info?: Json
          specialty?: string | null
          symptoms?: string[]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      clinical_portfolio: {
        Row: {
          cid_code: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          learnings: string | null
          specialty: string | null
          title: string
          user_id: string
        }
        Insert: {
          cid_code?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          learnings?: string | null
          specialty?: string | null
          title: string
          user_id: string
        }
        Update: {
          cid_code?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          learnings?: string | null
          specialty?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      dev_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          key_name: string
          key_value: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key_name: string
          key_value: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          key_value?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          subject_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          subject_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          subject_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          created_at: string
          ease_factor: number
          front: string
          id: string
          interval: number
          next_review: string
          repetitions: number
          subject_id: string | null
          user_id: string
        }
        Insert: {
          back: string
          created_at?: string
          ease_factor?: number
          front: string
          id?: string
          interval?: number
          next_review?: string
          repetitions?: number
          subject_id?: string | null
          user_id: string
        }
        Update: {
          back?: string
          created_at?: string
          ease_factor?: number
          front?: string
          id?: string
          interval?: number
          next_review?: string
          repetitions?: number
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          name: string
          subject_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          name: string
          subject_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          name?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_confirmations: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string
          id: string
          note: string | null
          pix_key: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string
          id?: string
          note?: string | null
          pix_key: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          id?: string
          note?: string | null
          pix_key?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean
          is_premium: boolean
          level: number
          semester: number | null
          university: string | null
          updated_at: string
          user_id: string
          xp_points: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_premium?: boolean
          level?: number
          semester?: number | null
          university?: string | null
          updated_at?: string
          user_id: string
          xp_points?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          is_premium?: boolean
          level?: number
          semester?: number | null
          university?: string | null
          updated_at?: string
          user_id?: string
          xp_points?: number
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_answer: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_answer: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_answer?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string
          explanation: string | null
          id: string
          options: Json
          question: string
          subject_id: string | null
          user_id: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question: string
          subject_id?: string | null
          user_id: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          session_type: string
          subject_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          id?: string
          session_type?: string
          subject_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          session_type?: string
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          plan_type: string
          started_at: string | null
          status: SubscriptionStatus
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan_type?: string
          started_at?: string | null
          status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          plan_type?: string
          started_at?: string | null
          status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          content: string
          created_at: string
          id: string
          subject_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          subject_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          goal: string | null
          id: string
          onboarding_completed: boolean
          preferred_days: string[] | null
          study_hours_per_week: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal?: string | null
          id?: string
          onboarding_completed?: boolean
          preferred_days?: string[] | null
          study_hours_per_week?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal?: string | null
          id?: string
          onboarding_completed?: boolean
          preferred_days?: string[] | null
          study_hours_per_week?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_sources: {
        Row: {
          created_at: string
          extracted_text: string | null
          file_url: string | null
          id: string
          source_type: string
          subject_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_text?: string | null
          file_url?: string | null
          id?: string
          source_type: string
          subject_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_text?: string | null
          file_url?: string | null
          id?: string
          source_type?: string
          subject_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_sources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          activity_type: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          subject_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          subject_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp_logs: {
        Row: {
          created_at: string
          id: string
          reason: string
          reference_id: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reference_id?: string | null
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reference_id?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_study_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_study_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_study_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subject_catalog: {
        Row: {
          id: string
          name: string
          group_type: 'grad' | 'resid'
          group_key: string
          group_label: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          group_type: 'grad' | 'resid'
          group_key: string
          group_label: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          group_type?: 'grad' | 'resid'
          group_key?: string
          group_label?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      is_paid_user: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      is_dev_user: {
        Args: {
          p_email: string
        }
        Returns: boolean
      }
      can_access_content: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      get_subscription_status: {
        Args: {
          p_user_id: string
        }
        Returns: {
          status: SubscriptionStatus
          plan_type: string
          paid_at: string | null
          expires_at: string | null
          days_remaining: number
          is_valid: boolean
        }[]
      }
      has_valid_subscription: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          p_email: string
        }
        Returns: boolean
      }
      is_admin_by_id: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      update_subscription: {
        Args: {
          p_user_id: string
          p_status: SubscriptionStatus
          p_expires_at?: string | null
          p_plan_type?: string
          p_stripe_subscription_id?: string
        }
        Returns: boolean
      }
      complete_onboarding: {
        Args: {
          p_user_id: string
          p_subject_names: string[]
        }
        Returns: {
          success: boolean
          message: string
          created_count: number
          error?: string
        }
      }
    }
    Enums: {
      subscription_status: SubscriptionStatus
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
    Enums: {},
  },
} as const

// === NEW TYPES FOR ONBOARDING & CONTENT AUTOMATION ===

export interface UserPreferences {
  id: string
  user_id: string
  goal: 'prova' | 'residencia' | 'faculdade' | null
  study_hours_per_week: number | null
  preferred_days: string[] | null
  created_at: string
  updated_at: string
  onboarding_completed: boolean
}

export interface ContentSource {
  id: string
  user_id: string
  subject_id: string | null
  title: string
  source_type: 'text' | 'pdf' | 'url'
  extracted_text: string | null
  file_url: string | null
  created_at: string
}

export interface StudyPlan {
  id: string
  user_id: string
  subject_id: string | null
  day_of_week: number // 0-6 (Sunday-Saturday)
  start_time: string // '09:00'
  end_time: string // '10:00'
  activity_type: 'review' | 'study' | 'practice'
  is_active: boolean
  created_at: string
}

export interface UserXPLog {
  id: string
  user_id: string
  xp_amount: number
  reason: string
  reference_id: string | null
  created_at: string
}

export interface UserStreak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_study_date: string | null
  created_at: string
  updated_at: string
}

// === CONTENT GENERATION TYPES ===

export interface GeneratedSummary {
  title: string
  content: string
  topics: string[]
  keyTerms: string[]
}

export interface GeneratedFlashcard {
  front: string
  back: string
}

export interface GeneratedQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface ContentGenerationResult {
  summary: GeneratedSummary
  flashcards: GeneratedFlashcard[]
  questions: GeneratedQuestion[]
}

// === NEXT BEST ACTION TYPES ===

export type NextBestActionType = 
  | 'onboarding'
  | 'review_flashcards'
  | 'do_quiz'
  | 'generate_content'
  | 'quick_session'
  | 'continue_studying'

export interface NextBestAction {
  type: NextBestActionType
  title: string
  description: string
  cta: string
  path: string
  priority: number
  estimatedMinutes: number
  xpReward: number
}
