import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">TimeBlocking</h1>
        <p className="mt-2 text-muted-foreground">
          A local-first calendar and task manager with time-block execution.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Project foundation</CardTitle>
          <CardDescription>No product features have been implemented yet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This is the professional project foundation: React + TypeScript + Vite,
            Tailwind CSS, and shadcn/ui are configured.
          </p>
          <p>
            Product features will be built phase-by-phase. See{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">docs/DEVELOPMENT_PLAN.md</code>.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default App