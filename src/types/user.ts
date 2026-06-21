import type { Role } from '@/constants/enums'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  mobile_number?: string
  gender?: string
  address?: string
  role: Role
  is_active: boolean
  is_staff: boolean
  date_joined: string
}

export interface UserDetail extends User {
  total_routes: number
  saved_locations_count: number
  favorite_routes_count: number
}

export interface UserUpdatePayload {
  first_name?: string
  last_name?: string
  mobile_number?: string
  gender?: string
  address?: string
  role?: Role
  is_active?: boolean
}

export interface AuthResponse {
  token: string
  refresh_token: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}
