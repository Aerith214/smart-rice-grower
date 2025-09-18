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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      daily_rainfall: {
        Row: {
          created_at: string | null
          date: string
          id: string
          rainfall_amount: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          rainfall_amount?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          rainfall_amount?: number | null
        }
        Relationships: []
      }
      harvest_analysis: {
        Row: {
          accuracy_notes: string | null
          created_at: string
          harvest_log_id: string
          id: string
          rainfall_during_period: number | null
          rainfall_relevance_score: number | null
          timing_difference_days: number | null
          weather_impact_factor: string | null
        }
        Insert: {
          accuracy_notes?: string | null
          created_at?: string
          harvest_log_id: string
          id?: string
          rainfall_during_period?: number | null
          rainfall_relevance_score?: number | null
          timing_difference_days?: number | null
          weather_impact_factor?: string | null
        }
        Update: {
          accuracy_notes?: string | null
          created_at?: string
          harvest_log_id?: string
          id?: string
          rainfall_during_period?: number | null
          rainfall_relevance_score?: number | null
          timing_difference_days?: number | null
          weather_impact_factor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "harvest_analysis_harvest_log_id_fkey"
            columns: ["harvest_log_id"]
            isOneToOne: false
            referencedRelation: "harvest_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      harvest_logs: {
        Row: {
          actual_harvest_date: string
          actual_harvest_time: string | null
          created_at: string
          crop_type: string
          id: string
          notes: string | null
          recommended_harvest_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_harvest_date: string
          actual_harvest_time?: string | null
          created_at?: string
          crop_type: string
          id?: string
          notes?: string | null
          recommended_harvest_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_harvest_date?: string
          actual_harvest_time?: string | null
          created_at?: string
          crop_type?: string
          id?: string
          notes?: string | null
          recommended_harvest_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_rainfall: {
        Row: {
          created_at: string | null
          id: string
          month: number | null
          rainfall_amount: number | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          month?: number | null
          rainfall_amount?: number | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: number | null
          rainfall_amount?: number | null
          year?: number | null
        }
        Relationships: []
      }
      planting_recommendations: {
        Row: {
          created_at: string | null
          created_by: string | null
          harvesting_date: string | null
          id: string
          planting_date: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          harvesting_date?: string | null
          id?: string
          planting_date?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          harvesting_date?: string | null
          id?: string
          planting_date?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
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
