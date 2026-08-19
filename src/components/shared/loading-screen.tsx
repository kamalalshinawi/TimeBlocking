export function LoadingScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3">
      <div
        aria-hidden="true"
        className="size-8 animate-spin rounded-full border-2 border-border border-t-primary"
      />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}