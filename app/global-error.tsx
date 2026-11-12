"use client"

import "./globals.css"

// Shown when the root layout fails, for example when the catalog cannot load from Supabase.
// It replaces the root layout, so it brings its own <html> and <body>.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en-US">
      <body>
        <main className="mx-auto w-full max-w-[1200px] px-m py-section sm:px-l lg:px-xl">
          <h1 className="font-display-wide text-display-m font-heavy">
            This page did not load.
          </h1>
          <p className="mt-s max-w-[52ch] text-body-m text-muted-foreground">
            We could not reach our club data. Try again, or call member services
            at (480) 555-0100.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-l inline-flex min-h-11 items-center corner-s bg-primary px-l text-body-s text-primary-foreground font-heavy"
          >
            Try again
          </button>
          {error.digest ? (
            <p className="mt-l text-body-s text-muted-foreground">
              Request ID {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  )
}
