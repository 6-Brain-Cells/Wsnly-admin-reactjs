import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/use-document-title'

export default function NotFound() {
  const navigate = useNavigate()
  useDocumentTitle('Page not found')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-2 text-7xl font-bold text-primary">404</div>
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button onClick={() => navigate(-1)} className="mt-6" variant="outline">
        <ArrowLeft className="h-4 w-4" />
        Go back
      </Button>
    </div>
  )
}
