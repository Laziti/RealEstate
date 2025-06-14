export interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  location?: string;
  created_at: string;
  main_image_url?: string;
  additional_image_urls?: string[];
  whatsapp_link?: string;
  telegram_link?: string;
  user_id?: string;
  city?: string;
  progress_status?: string;
  bank_option?: boolean;
  down_payment_percent?: number;
}

export interface Agent {
  whatsapp_link?: string;
  telegram_link?: string;
  id: string;
  first_name: string;
  last_name: string;
  career?: string;
  phone_number?: string;
  avatar_url?: string;
  slug?: string;
  status: 'pending' | 'approved' | 'rejected';
} 