export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          additional_image_urls: string[] | null
          bank_option: boolean | null
          city: string | null
          created_at: string | null
          description: string | null
          down_payment_percent: number | null
          edit_count: number | null
          id: string
          location: string | null
          main_image_url: string | null
          phone_number: string | null
          price: number | null
          progress_status: string | null
          status: string | null
          telegram_link: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          whatsapp_link: string | null
        }
        Insert: {
          additional_image_urls?: string[] | null
          bank_option?: boolean | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          down_payment_percent?: number | null
          edit_count?: number | null
          id?: string
          location?: string | null
          main_image_url?: string | null
          phone_number?: string | null
          price?: number | null
          progress_status?: string | null
          status?: string | null
          telegram_link?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          additional_image_urls?: string[] | null
          bank_option?: boolean | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          down_payment_percent?: number | null
          edit_count?: number | null
          id?: string
          location?: string | null
          main_image_url?: string | null
          phone_number?: string | null
          price?: number | null
          progress_status?: string | null
          status?: string | null
          telegram_link?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          career: string | null
          company: string | null
          created_at: string | null
          first_name: string | null
          has_seen_welcome: boolean | null
          id: string
          last_name: string | null
          listing_limit: Json | null
          phone_number: string | null
          slug: string | null
          social_links: Json | null
          status: string | null
          subscription_details: Json | null
          subscription_duration: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_type: string | null
          telegram_link: string | null
          updated_at: string | null
          user_id: string
          whatsapp_link: string | null
        }
        Insert: {
          avatar_url?: string | null
          career?: string | null
          company?: string | null
          created_at?: string | null
          first_name?: string | null
          has_seen_welcome?: boolean | null
          id: string
          last_name?: string | null
          listing_limit?: Json | null
          phone_number?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: string | null
          subscription_details?: Json | null
          subscription_duration?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          telegram_link?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_link?: string | null
        }
        Update: {
          avatar_url?: string | null
          career?: string | null
          company?: string | null
          created_at?: string | null
          first_name?: string | null
          has_seen_welcome?: boolean | null
          id?: string
          last_name?: string | null
          listing_limit?: Json | null
          phone_number?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: string | null
          subscription_details?: Json | null
          subscription_duration?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_type?: string | null
          telegram_link?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_link?: string | null
        }
        Relationships: []
      }
      receipts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          receipt_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          subscription_months: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          receipt_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          subscription_months: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          receipt_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          subscription_months?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_requests: {
        Row: {
          amount: number
          created_at: string | null
          duration: string
          id: string
          listings_per_month: number
          plan_id: string
          receipt_path: string
          status:
            | Database["public"]["Enums"]["subscription_request_status"]
            | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          duration: string
          id?: string
          listings_per_month: number
          plan_id: string
          receipt_path: string
          status?:
            | Database["public"]["Enums"]["subscription_request_status"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          duration?: string
          id?: string
          listings_per_month?: number
          plan_id?: string
          receipt_path?: string
          status?:
            | Database["public"]["Enums"]["subscription_request_status"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      generate_unique_slug: {
        Args: { first_name: string; last_name: string }
        Returns: string
      }
      get_auth_users_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
        }[]
      }
      get_plan_listing_limit: {
        Args: { plan_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { lookup_user_id: string }
        Returns: boolean
      }
      toggle_handle_new_user_trigger: {
        Args: Record<PropertyKey, never> | { enable: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "agent"
      subscription_plan:
        | "free"
        | "monthly-basic"
        | "monthly-premium"
        | "semi-annual"
      subscription_request_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "agent"],
      subscription_plan: [
        "free",
        "monthly-basic",
        "monthly-premium",
        "semi-annual",
      ],
      subscription_request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
