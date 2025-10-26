export interface RecipeBook {
  id: string
  name: string
  description?: string
  owner_id: string
  is_shared: boolean
  created_at: string
  updated_at: string
  // Joined data
  member_count?: number
  recipe_count?: number
  user_role?: 'owner' | 'editor' | 'viewer'
}

export interface BookMember {
  id: string
  book_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  invited_by?: string
  joined_at: string
  // Joined data from auth.users
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export type BookRole = 'owner' | 'editor' | 'viewer'

export interface BookWithMembers extends RecipeBook {
  members: BookMember[]
}
