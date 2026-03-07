// ============================================================
// Tipos centrales de ComuGest IA
// ============================================================

export type Plan = 'basic' | 'pro'
export type SubscriptionStatus = 'active' | 'trial' | 'paused' | 'cancelled'
export type UserRole = 'neighbor' | 'admin' | 'president'
export type IncidentCategory = 'elevator' | 'garage' | 'cleaning' | 'noise' | 'other'
export type IncidentPriority = 'low' | 'medium' | 'high'
export type IncidentStatus = 'open' | 'in_progress' | 'closed'
export type NoticeType = 'general' | 'meeting' | 'maintenance' | 'cleaning' | 'works'
export type ReservationStatus = 'confirmed' | 'cancelled'
export type DocType = 'rules' | 'payment' | 'other'
export type FileType = 'image' | 'video' | 'other'
export type ProfileStatus = 'pending' | 'active' | 'suspended' | 'rejected'

export interface Community {
  id: string
  name: string
  address: string | null
  code: string // Matches database
  plan: Plan
  subscription_status: SubscriptionStatus
  created_at: string
}

export interface Profile {
  id: string
  community_id: string | null
  full_name: string | null
  email: string | null
  phone: string | null
  role: UserRole
  unit: string | null
  avatar_url: string | null
  status: ProfileStatus
  created_at: string
  // join
  communities?: Community
}

export interface Incident {
  id: string
  community_id: string
  created_by: string
  title: string
  description: string | null
  category: string
  priority: string
  status: IncidentStatus
  ai_summary: string | null
  created_at: string
  updated_at: string
  // joins
  profiles?: Profile
  incident_attachments?: IncidentAttachment[]
  incident_comments?: IncidentComment[]
}

export interface IncidentAttachment {
  id: string
  incident_id: string
  file_url: string
  file_type: string
  created_at: string
}

export interface IncidentComment {
  id: string
  incident_id: string
  user_id: string // Renamed from author_id to match SQL
  body: string // Renamed from message to match SQL
  created_at: string
  // join
  profiles?: Profile
}

export interface Notice {
  id: string
  community_id: string
  created_by: string
  title: string
  body: string
  short_body: string | null
  type: NoticeType
  created_at: string
  // join
  profiles?: Profile
}

export interface Space {
  id: string
  community_id: string
  name: string
  description: string | null
  image_url: string | null
  rules: string | null
  opening_time: string
  closing_time: string
  reservation_duration: number
  max_capacity: number
  created_at: string
}

export interface Reservation {
  id: string
  community_id: string
  space_id: string
  user_id: string
  start_time: string
  end_time: string
  status: ReservationStatus
  notes: string | null
  created_at: string
  // joins
  spaces?: Space
  profiles?: Profile
}

export interface Doc {
  id: string
  community_id: string
  title: string
  body: string | null
  type: DocType
  created_at: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AiSession {
  id: string
  community_id: string
  user_id: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

// ---- Plan features ----
export const PLAN_FEATURES = {
  basic: {
    incidents: true,
    notices: true,
    reservations: false,
    ai_chat: false,
    ai_generate_notice: false,
    ai_summarize: false,
  },
  pro: {
    incidents: true,
    notices: true,
    reservations: true,
    ai_chat: true,
    ai_generate_notice: true,
    ai_summarize: true,
  },
} as const

export type PlanFeatures = typeof PLAN_FEATURES[Plan]
