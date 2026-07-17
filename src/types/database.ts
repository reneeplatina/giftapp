/**
 * Hand-authored to match `supabase gen types typescript --local` output.
 * No local Supabase stack was available to run the generator in this
 * environment — regenerate this file for real once a project is linked:
 *
 *   supabase gen types typescript --local > src/types/database.ts
 *
 * Keep it in sync with supabase/migrations/*.sql until then.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          slug: string;
          display_name: string;
          avatar_path: string | null;
          introduction: string;
          gift_style_summary: string;
          birthday: string | null;
          default_theme: string;
          status: Database["public"]["Enums"]["profile_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          display_name: string;
          avatar_path?: string | null;
          introduction?: string;
          gift_style_summary?: string;
          birthday?: string | null;
          default_theme?: string;
          status?: Database["public"]["Enums"]["profile_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          display_name?: string;
          avatar_path?: string | null;
          introduction?: string;
          gift_style_summary?: string;
          birthday?: string | null;
          default_theme?: string;
          status?: Database["public"]["Enums"]["profile_status"];
          created_at?: string;
          updated_at?: string;
        };
      };
      profile_sections: {
        Row: {
          id: string;
          profile_id: string;
          section_key: string;
          data: Json;
          is_public: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          section_key: string;
          data?: Json;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          section_key?: string;
          data?: Json;
          is_public?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          description: string;
          image_path: string | null;
          product_url: string | null;
          estimated_price: number | null;
          budget_level: Database["public"]["Enums"]["wishlist_budget_level"] | null;
          category: string | null;
          priority: Database["public"]["Enums"]["wishlist_priority"];
          preferred_color: string | null;
          preferred_size: string | null;
          acceptable_alternatives: string | null;
          accepts_used: boolean;
          accepts_refurbished: boolean;
          accepts_contributions: boolean;
          item_type: Database["public"]["Enums"]["wishlist_item_type"];
          is_public: boolean;
          is_archived: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          description?: string;
          image_path?: string | null;
          product_url?: string | null;
          estimated_price?: number | null;
          budget_level?: Database["public"]["Enums"]["wishlist_budget_level"] | null;
          category?: string | null;
          priority?: Database["public"]["Enums"]["wishlist_priority"];
          preferred_color?: string | null;
          preferred_size?: string | null;
          acceptable_alternatives?: string | null;
          accepts_used?: boolean;
          accepts_refurbished?: boolean;
          accepts_contributions?: boolean;
          item_type?: Database["public"]["Enums"]["wishlist_item_type"];
          is_public?: boolean;
          is_archived?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          description?: string;
          image_path?: string | null;
          product_url?: string | null;
          estimated_price?: number | null;
          budget_level?: Database["public"]["Enums"]["wishlist_budget_level"] | null;
          category?: string | null;
          priority?: Database["public"]["Enums"]["wishlist_priority"];
          preferred_color?: string | null;
          preferred_size?: string | null;
          acceptable_alternatives?: string | null;
          accepts_used?: boolean;
          accepts_refurbished?: boolean;
          accepts_contributions?: boolean;
          item_type?: Database["public"]["Enums"]["wishlist_item_type"];
          is_public?: boolean;
          is_archived?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_interview_sessions: {
        Row: {
          id: string;
          profile_id: string;
          status: Database["public"]["Enums"]["ai_interview_status"];
          current_topic: string | null;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          status?: Database["public"]["Enums"]["ai_interview_status"];
          current_topic?: string | null;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          status?: Database["public"]["Enums"]["ai_interview_status"];
          current_topic?: string | null;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      ai_interview_messages: {
        Row: {
          id: string;
          session_id: string;
          profile_id: string;
          role: Database["public"]["Enums"]["ai_message_role"];
          content: string;
          structured_updates: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          profile_id: string;
          role: Database["public"]["Enums"]["ai_message_role"];
          content: string;
          structured_updates?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          profile_id?: string;
          role?: Database["public"]["Enums"]["ai_message_role"];
          content?: string;
          structured_updates?: Json | null;
          created_at?: string;
        };
      };
      ai_suggestions: {
        Row: {
          id: string;
          profile_id: string;
          suggestion_type: string;
          content: Json;
          status: Database["public"]["Enums"]["ai_suggestion_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          suggestion_type: string;
          content: Json;
          status?: Database["public"]["Enums"]["ai_suggestion_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          suggestion_type?: string;
          content?: Json;
          status?: Database["public"]["Enums"]["ai_suggestion_status"];
          created_at?: string;
          updated_at?: string;
        };
      };
      gift_exchange_requests: {
        Row: {
          id: string;
          source_profile_id: string;
          recipient_label: string | null;
          exchange_token: string;
          referred_user_id: string | null;
          referred_profile_id: string | null;
          status: Database["public"]["Enums"]["exchange_status"];
          share_count: number;
          last_shared_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_profile_id: string;
          recipient_label?: string | null;
          exchange_token?: string;
          referred_user_id?: string | null;
          referred_profile_id?: string | null;
          status?: Database["public"]["Enums"]["exchange_status"];
          share_count?: number;
          last_shared_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_profile_id?: string;
          recipient_label?: string | null;
          exchange_token?: string;
          referred_user_id?: string | null;
          referred_profile_id?: string | null;
          status?: Database["public"]["Enums"]["exchange_status"];
          share_count?: number;
          last_shared_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_usage_events: {
        Row: {
          id: string;
          user_id: string | null;
          anonymous_session_hash: string | null;
          feature_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          anonymous_session_hash?: string | null;
          feature_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          anonymous_session_hash?: string | null;
          feature_name?: string;
          created_at?: string;
        };
      };
      profile_reports: {
        Row: {
          id: string;
          reported_profile_id: string;
          reporter_user_id: string | null;
          reason: string;
          details: string | null;
          status: Database["public"]["Enums"]["profile_report_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          reported_profile_id: string;
          reporter_user_id?: string | null;
          reason: string;
          details?: string | null;
          status?: Database["public"]["Enums"]["profile_report_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          reported_profile_id?: string;
          reporter_user_id?: string | null;
          reason?: string;
          details?: string | null;
          status?: Database["public"]["Enums"]["profile_report_status"];
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_public_profile: {
        Args: { profile_slug: string };
        Returns: Json;
      };
      resolve_exchange_token: {
        Args: { token: string };
        Returns: Json;
      };
      claim_exchange_request: {
        Args: { token: string };
        Returns: Json;
      };
      complete_exchange_request: {
        Args: { token: string; referred_profile_slug: string };
        Returns: Json;
      };
      is_profile_published: {
        Args: { p_profile_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      profile_status: "draft" | "published" | "hidden";
      wishlist_priority: "nice_to_have" | "would_love" | "dream_gift";
      wishlist_item_type: "exact_item" | "general_idea" | "dream_gift";
      wishlist_budget_level: "under_25" | "25_to_75" | "75_to_200" | "over_200";
      ai_interview_status: "in_progress" | "completed" | "abandoned";
      ai_message_role: "user" | "assistant";
      ai_suggestion_status: "pending" | "accepted" | "dismissed";
      exchange_status: "created" | "started" | "completed" | "cancelled";
      profile_report_status: "open" | "reviewed" | "resolved";
    };
  };
};
