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
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          career?: string | null
          phone_number?: string | null
          whatsapp_link?: string | null
          telegram_link?: string | null
          avatar_url?: string | null
          listing_limit: {
            type: string
            value: number
          } | null
          subscription_status: 'free' | 'pro'
          subscription_details?: {
            plan_id: string
            listings_per_month: number
            duration: string
            amount: number
            start_date: string
            end_date: string
            subscription_request_id: string
          } | null
          subscription_end_date?: string | null
          slug?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          career?: string | null
          phone_number?: string | null
          whatsapp_link?: string | null
          telegram_link?: string | null
          avatar_url?: string | null
          listing_limit?: Json | null
          subscription_status?: 'free' | 'pro'
          subscription_details?: Json | null
          subscription_end_date?: string | null
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          career?: string | null
          phone_number?: string | null
          whatsapp_link?: string | null
          telegram_link?: string | null
          avatar_url?: string | null
          listing_limit?: Json | null
          subscription_status?: 'free' | 'pro'
          subscription_details?: Json | null
          subscription_end_date?: string | null
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
} 