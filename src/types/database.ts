/**
 * Generated via the Supabase MCP `generate_typescript_types` tool against
 * the live project — regenerate the same way after any schema migration.
 */

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_interview_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          profile_id: string
          role: Database["public"]["Enums"]["ai_message_role"]
          session_id: string
          structured_updates: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          profile_id: string
          role: Database["public"]["Enums"]["ai_message_role"]
          session_id: string
          structured_updates?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["ai_message_role"]
          session_id?: string
          structured_updates?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_interview_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interview_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_interview_sessions: {
        Row: {
          completed_at: string | null
          completion_percentage: number
          created_at: string
          current_topic: string | null
          id: string
          profile_id: string
          status: Database["public"]["Enums"]["ai_interview_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string
          current_topic?: string | null
          id?: string
          profile_id: string
          status?: Database["public"]["Enums"]["ai_interview_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number
          created_at?: string
          current_topic?: string | null
          id?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["ai_interview_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_interview_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          content: Json
          created_at: string
          id: string
          profile_id: string
          status: Database["public"]["Enums"]["ai_suggestion_status"]
          suggestion_type: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          profile_id: string
          status?: Database["public"]["Enums"]["ai_suggestion_status"]
          suggestion_type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["ai_suggestion_status"]
          suggestion_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_events: {
        Row: {
          anonymous_session_hash: string | null
          created_at: string
          feature_name: string
          id: string
          user_id: string | null
        }
        Insert: {
          anonymous_session_hash?: string | null
          created_at?: string
          feature_name: string
          id?: string
          user_id?: string | null
        }
        Update: {
          anonymous_session_hash?: string | null
          created_at?: string
          feature_name?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      gift_exchange_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          exchange_token: string
          id: string
          last_shared_at: string | null
          recipient_label: string | null
          referred_profile_id: string | null
          referred_user_id: string | null
          share_count: number
          source_profile_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["exchange_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          exchange_token?: string
          id?: string
          last_shared_at?: string | null
          recipient_label?: string | null
          referred_profile_id?: string | null
          referred_user_id?: string | null
          share_count?: number
          source_profile_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["exchange_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          exchange_token?: string
          id?: string
          last_shared_at?: string | null
          recipient_label?: string | null
          referred_profile_id?: string | null
          referred_user_id?: string | null
          share_count?: number
          source_profile_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["exchange_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_exchange_requests_referred_profile_id_fkey"
            columns: ["referred_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_exchange_requests_source_profile_id_fkey"
            columns: ["source_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_images: {
        Row: {
          caption: string
          created_at: string
          id: string
          image_path: string
          is_public: boolean
          profile_id: string
          sort_order: number
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          image_path: string
          is_public?: boolean
          profile_id: string
          sort_order?: number
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          image_path?: string
          is_public?: boolean
          profile_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_images_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_profile_id: string
          reporter_user_id: string | null
          status: Database["public"]["Enums"]["profile_report_status"]
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_profile_id: string
          reporter_user_id?: string | null
          status?: Database["public"]["Enums"]["profile_report_status"]
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_profile_id?: string
          reporter_user_id?: string | null
          status?: Database["public"]["Enums"]["profile_report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "profile_reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_sections: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_public: boolean
          profile_id: string
          section_key: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          is_public?: boolean
          profile_id: string
          section_key: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_public?: boolean
          profile_id?: string
          section_key?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_sections_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          birthday: string | null
          created_at: string
          default_theme: string
          display_name: string
          gift_style_summary: string
          id: string
          introduction: string
          managed_by_profile_id: string | null
          slug: string
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          birthday?: string | null
          created_at?: string
          default_theme?: string
          display_name: string
          gift_style_summary?: string
          id: string
          introduction?: string
          managed_by_profile_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          birthday?: string | null
          created_at?: string
          default_theme?: string
          display_name?: string
          gift_style_summary?: string
          id?: string
          introduction?: string
          managed_by_profile_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_managed_by_profile_id_fkey"
            columns: ["managed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          acceptable_alternatives: string | null
          accepts_contributions: boolean
          accepts_refurbished: boolean
          accepts_used: boolean
          budget_level:
            | Database["public"]["Enums"]["wishlist_budget_level"]
            | null
          category: string | null
          created_at: string
          description: string
          estimated_price: number | null
          id: string
          image_path: string | null
          is_archived: boolean
          is_public: boolean
          item_type: Database["public"]["Enums"]["wishlist_item_type"]
          name: string
          preferred_color: string | null
          preferred_size: string | null
          priority: Database["public"]["Enums"]["wishlist_priority"]
          product_url: string | null
          profile_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          acceptable_alternatives?: string | null
          accepts_contributions?: boolean
          accepts_refurbished?: boolean
          accepts_used?: boolean
          budget_level?:
            | Database["public"]["Enums"]["wishlist_budget_level"]
            | null
          category?: string | null
          created_at?: string
          description?: string
          estimated_price?: number | null
          id?: string
          image_path?: string | null
          is_archived?: boolean
          is_public?: boolean
          item_type?: Database["public"]["Enums"]["wishlist_item_type"]
          name: string
          preferred_color?: string | null
          preferred_size?: string | null
          priority?: Database["public"]["Enums"]["wishlist_priority"]
          product_url?: string | null
          profile_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          acceptable_alternatives?: string | null
          accepts_contributions?: boolean
          accepts_refurbished?: boolean
          accepts_used?: boolean
          budget_level?:
            | Database["public"]["Enums"]["wishlist_budget_level"]
            | null
          category?: string | null
          created_at?: string
          description?: string
          estimated_price?: number | null
          id?: string
          image_path?: string | null
          is_archived?: boolean
          is_public?: boolean
          item_type?: Database["public"]["Enums"]["wishlist_item_type"]
          name?: string
          preferred_color?: string | null
          preferred_size?: string | null
          priority?: Database["public"]["Enums"]["wishlist_priority"]
          product_url?: string | null
          profile_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_exchange_request: { Args: { token: string }; Returns: Json }
      complete_exchange_request: {
        Args: { referred_profile_slug: string; token: string }
        Returns: Json
      }
      get_public_profile: { Args: { profile_slug: string }; Returns: Json }
      is_profile_published: { Args: { p_profile_id: string }; Returns: boolean }
      resolve_exchange_token: { Args: { token: string }; Returns: Json }
    }
    Enums: {
      ai_interview_status: "in_progress" | "completed" | "abandoned"
      ai_message_role: "user" | "assistant"
      ai_suggestion_status: "pending" | "accepted" | "dismissed"
      exchange_status: "created" | "started" | "completed" | "cancelled"
      profile_report_status: "open" | "reviewed" | "resolved"
      profile_status: "draft" | "published" | "hidden"
      wishlist_budget_level: "under_25" | "25_to_75" | "75_to_200" | "over_200"
      wishlist_item_type: "exact_item" | "general_idea" | "dream_gift"
      wishlist_priority: "nice_to_have" | "would_love" | "dream_gift"
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
      ai_interview_status: ["in_progress", "completed", "abandoned"],
      ai_message_role: ["user", "assistant"],
      ai_suggestion_status: ["pending", "accepted", "dismissed"],
      exchange_status: ["created", "started", "completed", "cancelled"],
      profile_report_status: ["open", "reviewed", "resolved"],
      profile_status: ["draft", "published", "hidden"],
      wishlist_budget_level: ["under_25", "25_to_75", "75_to_200", "over_200"],
      wishlist_item_type: ["exact_item", "general_idea", "dream_gift"],
      wishlist_priority: ["nice_to_have", "would_love", "dream_gift"],
    },
  },
} as const
