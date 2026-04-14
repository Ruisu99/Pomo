export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-lg space-y-2 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-6 text-center">
      <h1 className="text-xl font-semibold">You’re offline</h1>
      <p className="text-sm text-[var(--color-muted)]">
        This page isn’t cached yet, but your installed app can still run the timer when it’s
        available offline.
      </p>
    </div>
  );
}
