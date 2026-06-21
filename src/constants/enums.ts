export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROUTE_FILTERS = {
  OPTIMAL: 1,
  FASTEST: 2,
  CHEAPEST: 3,
  BUS_ONLY: 4,
  MICROBUS_ONLY: 5,
  METRO_ONLY: 6,
} as const

export type RouteFilter =
  (typeof ROUTE_FILTERS)[keyof typeof ROUTE_FILTERS]

export const ROUTE_FILTER_LABELS: Record<RouteFilter, string> = {
  [ROUTE_FILTERS.OPTIMAL]: 'Optimal',
  [ROUTE_FILTERS.FASTEST]: 'Fastest',
  [ROUTE_FILTERS.CHEAPEST]: 'Cheapest',
  [ROUTE_FILTERS.BUS_ONLY]: 'Bus only',
  [ROUTE_FILTERS.MICROBUS_ONLY]: 'Microbus only',
  [ROUTE_FILTERS.METRO_ONLY]: 'Metro only',
}

export const TRANSPORT_METHODS = {
  WALK: 'walk',
  BUS: 'bus',
  METRO: 'metro',
  MICROBUS: 'microbus',
} as const

export type TransportMethod =
  (typeof TRANSPORT_METHODS)[keyof typeof TRANSPORT_METHODS]

export const ROUTE_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
} as const

export const ROUTE_SOURCE = {
  TEXT: 'text',
  MAP: 'map',
} as const

export const GENDERS = ['male', 'female', 'other'] as const
export type Gender = (typeof GENDERS)[number]
