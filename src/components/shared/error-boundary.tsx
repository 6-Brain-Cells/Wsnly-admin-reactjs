import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('App error boundary:', error, info)
    }
  }

  reset = () => this.setState({ hasError: false, error: undefined })

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Something broke
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {this.state.error?.message ??
              'An unexpected error occurred. Please try again.'}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={this.reset} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button onClick={() => (window.location.href = '/')}>
              Go home
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
