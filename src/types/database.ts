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
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          bio: string | null
          avatar_url: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          latitude: number | null
          longitude: number | null
          verified_professional: boolean
          verified_at: string | null
          avg_rating: number | null
          total_reviews: number
          total_exchanges: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          bio?: string | null
          avatar_url?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          verified_professional?: boolean
          verified_at?: string | null
          avg_rating?: number | null
          total_reviews?: number
          total_exchanges?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          bio?: string | null
          avatar_url?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          latitude?: number | null
          longitude?: number | null
          verified_professional?: boolean
          verified_at?: string | null
          avg_rating?: number | null
          total_reviews?: number
          total_exchanges?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          parent_id: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          parent_id?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          parent_id?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          user_id: string
          category_id: string
          type: 'offer' | 'need'
          title: string
          description: string | null
          estimated_value: number | null
          service_radius_miles: number
          status: 'pending' | 'active' | 'paused' | 'rejected'
          moderation_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          type: 'offer' | 'need'
          title: string
          description?: string | null
          estimated_value?: number | null
          service_radius_miles?: number
          status?: 'pending' | 'active' | 'paused' | 'rejected'
          moderation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          type?: 'offer' | 'need'
          title?: string
          description?: string | null
          estimated_value?: number | null
          service_radius_miles?: number
          status?: 'pending' | 'active' | 'paused' | 'rejected'
          moderation_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_images: {
        Row: {
          id: string
          service_id: string
          image_url: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          image_url: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          image_url?: string
          sort_order?: number
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant_one_id: string
          participant_two_id: string
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          participant_one_id: string
          participant_two_id: string
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          participant_one_id?: string
          participant_two_id?: string
          last_message_at?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          image_url: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          image_url?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          image_url?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      exchanges: {
        Row: {
          id: string
          user_a_id: string
          user_b_id: string
          service_a_id: string | null
          service_b_id: string | null
          service_a_description: string | null
          service_b_description: string | null
          estimated_value_a: number | null
          estimated_value_b: number | null
          status: 'proposed' | 'negotiating' | 'agreed' | 'in_progress' | 'completed' | 'cancelled'
          conversation_id: string | null
          proposed_at: string
          agreed_at: string | null
          completed_at: string | null
          user_a_completed: boolean
          user_b_completed: boolean
        }
        Insert: {
          id?: string
          user_a_id: string
          user_b_id: string
          service_a_id?: string | null
          service_b_id?: string | null
          service_a_description?: string | null
          service_b_description?: string | null
          estimated_value_a?: number | null
          estimated_value_b?: number | null
          status?: 'proposed' | 'negotiating' | 'agreed' | 'in_progress' | 'completed' | 'cancelled'
          conversation_id?: string | null
          proposed_at?: string
          agreed_at?: string | null
          completed_at?: string | null
          user_a_completed?: boolean
          user_b_completed?: boolean
        }
        Update: {
          id?: string
          user_a_id?: string
          user_b_id?: string
          service_a_id?: string | null
          service_b_id?: string | null
          service_a_description?: string | null
          service_b_description?: string | null
          estimated_value_a?: number | null
          estimated_value_b?: number | null
          status?: 'proposed' | 'negotiating' | 'agreed' | 'in_progress' | 'completed' | 'cancelled'
          conversation_id?: string | null
          proposed_at?: string
          agreed_at?: string | null
          completed_at?: string | null
          user_a_completed?: boolean
          user_b_completed?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          exchange_id: string
          reviewer_id: string
          reviewee_id: string
          quality_rating: number
          communication_rating: number
          timeliness_rating: number
          fairness_rating: number
          overall_rating: number
          comment: string | null
          would_trade_again: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          exchange_id: string
          reviewer_id: string
          reviewee_id: string
          quality_rating: number
          communication_rating: number
          timeliness_rating: number
          fairness_rating: number
          overall_rating: number
          comment?: string | null
          would_trade_again?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          exchange_id?: string
          reviewer_id?: string
          reviewee_id?: string
          quality_rating?: number
          communication_rating?: number
          timeliness_rating?: number
          fairness_rating?: number
          overall_rating?: number
          comment?: string | null
          would_trade_again?: boolean | null
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          state: string
          state_code: string
          city: string
          slug: string
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id?: string
          state: string
          state_code: string
          city: string
          slug: string
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          state?: string
          state_code?: string
          city?: string
          slug?: string
          latitude?: number | null
          longitude?: number | null
        }
      }
      blocked_users: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
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
      service_type: 'offer' | 'need'
      service_status: 'pending' | 'active' | 'paused' | 'rejected'
      exchange_status: 'proposed' | 'negotiating' | 'agreed' | 'in_progress' | 'completed' | 'cancelled'
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']

export type Service = Database['public']['Tables']['services']['Row']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']

export type ServiceImage = Database['public']['Tables']['service_images']['Row']

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

export type Exchange = Database['public']['Tables']['exchanges']['Row']
export type ExchangeInsert = Database['public']['Tables']['exchanges']['Insert']
export type ExchangeUpdate = Database['public']['Tables']['exchanges']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']

export type Location = Database['public']['Tables']['locations']['Row']

export type BlockedUser = Database['public']['Tables']['blocked_users']['Row']

// Extended types with joins
export type ServiceWithCategory = Service & {
  category: Category
}

export type ServiceWithUser = Service & {
  profile: Profile
  category: Category
  images: ServiceImage[]
}

export type ConversationWithParticipants = Conversation & {
  participant_one: Profile
  participant_two: Profile
  messages: Message[]
}

export type ExchangeWithDetails = Exchange & {
  user_a: Profile
  user_b: Profile
  service_a: Service | null
  service_b: Service | null
}

export type ReviewWithProfiles = Review & {
  reviewer: Profile
  reviewee: Profile
}
