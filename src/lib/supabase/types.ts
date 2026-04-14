Initialising login role...
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      pricing_rules: {
        Row: {
          amazon_closing_fee: number
          amazon_fee_rate: number
          avoid_amazon_present: boolean
          category_overrides: Json
          id: string
          max_buy_price: number | null
          slow_mover_rank_threshold: number | null
          target_roi_min: number
          updated_at: string
        }
        Insert: {
          amazon_closing_fee?: number
          amazon_fee_rate?: number
          avoid_amazon_present?: boolean
          category_overrides?: Json
          id?: string
          max_buy_price?: number | null
          slow_mover_rank_threshold?: number | null
          target_roi_min?: number
          updated_at?: string
        }
        Update: {
          amazon_closing_fee?: number
          amazon_fee_rate?: number
          avoid_amazon_present?: boolean
          category_overrides?: Json
          id?: string
          max_buy_price?: number | null
          slow_mover_rank_threshold?: number | null
          target_roi_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      submission_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          new_status: string | null
          old_status: string | null
          submission_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          submission_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_events_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          amazon_data: Json | null
          asin: string | null
          author: string | null
          batch_id: string | null
          claude_response: Json | null
          condition: Database["public"]["Enums"]["book_condition"]
          confidence_level: string | null
          contact_preference: Database["public"]["Enums"]["contact_preference"]
          contact_value: string
          created_at: string
          edition: string | null
          final_offer: number | null
          flags: string[] | null
          id: string
          isbn: string | null
          isbn_confidence:
            | Database["public"]["Enums"]["isbn_confidence_level"]
            | null
          isbn_extracted: string | null
          keepa_data: Json | null
          notes: string | null
          photo_urls: string[]
          publisher: string | null
          recommended_offer: number | null
          reference_number: string
          responded_at: string | null
          response_token: string | null
          seller_notes: string | null
          status: Database["public"]["Enums"]["submission_status"]
          title: string | null
        }
        Insert: {
          amazon_data?: Json | null
          asin?: string | null
          author?: string | null
          batch_id?: string | null
          claude_response?: Json | null
          condition: Database["public"]["Enums"]["book_condition"]
          confidence_level?: string | null
          contact_preference: Database["public"]["Enums"]["contact_preference"]
          contact_value: string
          created_at?: string
          edition?: string | null
          final_offer?: number | null
          flags?: string[] | null
          id?: string
          isbn?: string | null
          isbn_confidence?:
            | Database["public"]["Enums"]["isbn_confidence_level"]
            | null
          isbn_extracted?: string | null
          keepa_data?: Json | null
          notes?: string | null
          photo_urls?: string[]
          publisher?: string | null
          recommended_offer?: number | null
          reference_number?: string
          responded_at?: string | null
          response_token?: string | null
          seller_notes?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          title?: string | null
        }
        Update: {
          amazon_data?: Json | null
          asin?: string | null
          author?: string | null
          batch_id?: string | null
          claude_response?: Json | null
          condition?: Database["public"]["Enums"]["book_condition"]
          confidence_level?: string | null
          contact_preference?: Database["public"]["Enums"]["contact_preference"]
          contact_value?: string
          created_at?: string
          edition?: string | null
          final_offer?: number | null
          flags?: string[] | null
          id?: string
          isbn?: string | null
          isbn_confidence?:
            | Database["public"]["Enums"]["isbn_confidence_level"]
            | null
          isbn_extracted?: string | null
          keepa_data?: Json | null
          notes?: string | null
          photo_urls?: string[]
          publisher?: string | null
          recommended_offer?: number | null
          reference_number?: string
          responded_at?: string | null
          response_token?: string | null
          seller_notes?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          title?: string | null
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
      book_condition: "like_new" | "good" | "acceptable" | "poor"
      contact_preference: "sms" | "email"
      isbn_confidence_level: "low" | "medium" | "high"
      submission_status:
        | "pending_review"
        | "isbn_required"
        | "unidentifiable"
        | "offer_sent"
        | "pass_sent"
        | "accepted"
        | "declined"
        | "paid"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      book_condition: ["like_new", "good", "acceptable", "poor"],
      contact_preference: ["sms", "email"],
      isbn_confidence_level: ["low", "medium", "high"],
      submission_status: [
        "pending_review",
        "isbn_required",
        "unidentifiable",
        "offer_sent",
        "pass_sent",
        "accepted",
        "declined",
        "paid",
      ],
    },
  },
} as const

// Convenience aliases for commonly used enum types
export type SubmissionStatus = Database["public"]["Enums"]["submission_status"]
export type BookCondition = Database["public"]["Enums"]["book_condition"]
