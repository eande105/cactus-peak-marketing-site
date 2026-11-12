"use client"

import { useEffect } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { Button } from "@/components/ui/button"
import { Container } from "./common"

/**
 * The body of an error.tsx file. Next.js 16 passes `retry`, which fetches the segment again
 * (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md).
 */
export function RouteError({
  error,
  retry,
  title = "This page did not load.",
}: {
  error: Error & { digest?: string }
  retry: () => void
  /** Names what failed, for example "The schedule did not load." */
  title?: string
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <Container className="py-16 lg:py-24">
      <h1 className="font-display-wide text-h1 lg:text-display">{title}</h1>
      <p className="mt-3 max-w-[52ch] text-body text-muted-foreground">
        We could not reach our club data. Try again, or call member services at
        (480) 555-0100.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => retry()} size="lg">
          Try again
        </Button>
        <LinkButton href="/" variant="outline" size="lg">
          Go home
        </LinkButton>
      </div>
      {error.digest ? (
        <p className="mt-6 text-caption text-muted-foreground">
          Request ID {error.digest}
        </p>
      ) : null}
    </Container>
  )
}
