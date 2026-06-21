import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useLogin } from './hooks'
import { loginSchema, type LoginInput } from './schemas'
import { useAuthStore } from './store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { config } from '@/config/env'
import { ROUTES } from '@/constants/routes'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    document.title = 'Sign in · Wslny Admin'
    if (isAuthenticated) {
      navigate(ROUTES.dashboard, { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = (values: LoginInput) => {
    login.mutate(values, {
      onSuccess: () => {
        const from = (location.state as { from?: { pathname: string } } | null)?.from
        navigate(from?.pathname ?? ROUTES.dashboard, { replace: true })
      },
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

                  <Button variant="outline" className="w-full" size="lg" type="button">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
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
