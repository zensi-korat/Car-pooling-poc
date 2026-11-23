import { RotateCcw, TriangleAlert } from 'lucide-react'
import type { FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

// Shown by the ErrorBoundary in DashboardLayout when a page crashes while drawing.
export function PageError({ error, resetErrorBoundary }: Readonly<FallbackProps>) {
  return (
    <div className="p-6">
      <Empty className="rounded-xl border border-dashed bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Something went wrong on this page</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error ? error.message : 'An unexpected error happened.'} The rest of the app still works.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={resetErrorBoundary}>
            <RotateCcw data-icon="inline-start" />
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
