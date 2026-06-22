import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useGoogleLogin, useLogin } from './hooks'
import { loginSchema, type LoginInput } from './schemas'
import { useAuthStore } from './store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { config } from '@/config/env'
import { ROUTES } from '@/constants/routes'
import { useGoogleIdentity } from '@/lib/google-identity'
import { useDocumentTitle } from '@/hooks/use-document-title'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const googleLogin = useGoogleLogin()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const isAdmin = useAuthStore((s) => s.isAdmin())
  const [showPassword, setShowPassword] = useState(false)
  const { ready: gisReady, renderButton: renderGoogleButton } = useGoogleIdentity()
  const googleContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gisReady || !googleContainerRef.current) return
    renderGoogleButton(googleContainerRef.current)
    const node = googleContainerRef.current
    const onToken = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (typeof detail === 'string' && detail.length > 0) {
        googleLogin.mutate(detail, {
          onError: (err: { message?: string }) =>
            toast.error(err.message ?? 'Google sign-in failed'),
        })
      }
    }
    node.addEventListener('wslny-google-id-token', onToken)
    return () => node.removeEventListener('wslny-google-id-token', onToken)
  }, [gisReady, renderGoogleButton, googleLogin])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useDocumentTitle('Sign in')

  // Auto-navigate to the dashboard once auth is fully valid. Because
  // useLogin commits both the token AND the full user (with `role`)
  // atomically in a single setAuth call, isAuthenticated and isAdmin
  // flip to true in the same render — no intermediate "token without
  // role" window where RequireAdmin would bounce us back.
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const from = (location.state as { from?: { pathname: string } } | null)?.from
      navigate(from?.pathname ?? ROUTES.dashboard, { replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate, location.state])

  const onSubmit = (values: LoginInput) => {
    login.mutate(values, {
      onError: (err: { message?: string }) => {
        toast.error(err.message ?? 'Invalid email or password')
      },
    })
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-primary via-primary-dark to-brand-800 p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{config.appName}</p>
            <p className="text-xs text-white/70">Operations Console</p>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-balance text-4xl font-bold leading-tight xl:text-5xl">
            Move Cairo,<br />one route at a time.
          </h1>
          <p className="max-w-md text-pretty text-base text-white/80">
            The operations control center for the Wslny public-transit platform.
            Monitor usage, manage operators, and keep every journey on track.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-6">
            {[
              { label: 'Stops', value: '646' },
              { label: 'Routes', value: '441' },
              { label: 'Polylines', value: '242K' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/60">
          © {new Date().getFullYear()} Wslny · All rights reserved
        </p>

        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft lg:hidden">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in with your admin credentials to continue
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@wslny.com"
                    autoComplete="email"
                    autoFocus
                    {...register('email')}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      tabIndex={-1}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...register('password')}
                      aria-invalid={Boolean(errors.password)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={login.isPending}
                >
                  {login.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {login.isPending ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              {config.isGoogleEnabled && (
                <>
                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs uppercase text-muted-foreground">
                      or
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {googleLogin.isPending ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in with Google…
                    </Button>
                  ) : gisReady ? (
                    <div ref={googleContainerRef} className="flex justify-center" />
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      disabled
                      type="button"
                    >
                      Google sign-in unavailable
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Need access? Contact your platform administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
