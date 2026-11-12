"use client"

import { LinkButton } from "@/components/brand/atoms"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main
      id="main"
      className="mx-auto w-full max-w-[1200px] px-m py-section sm:px-l lg:px-xl"
    >
      <h1 className="font-display-wide text-display-m lg:text-display-xl font-heavy lg:font-heavy">
        Something broke on our side.
      </h1>
      <p className="mt-s max-w-[52ch] text-body-m text-muted-foreground">
        Try again in a minute, or call member services at (480) 555-0100.
      </p>
      <div className="mt-l flex flex-wrap gap-s">
        <Button onClick={() => retry()} size="lg">
          Try again
        </Button>
        <LinkButton href="/" variant="outline" size="lg">
          Go home
        </LinkButton>
      </div>
      {error.digest ? (
        <p className="mt-l text-body-s text-muted-foreground">
          Request ID {error.digest}
        </p>
      ) : null}
    </main>
  )
}
