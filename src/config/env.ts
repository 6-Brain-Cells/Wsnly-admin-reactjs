const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export const config = {
  apiBaseUrl,
  googleClientId,
  isGoogleEnabled: Boolean(googleClientId),
  appName: 'Wslny Admin',
  appDescription: 'Operations console for the Wslny public-transit platform',
} as const
