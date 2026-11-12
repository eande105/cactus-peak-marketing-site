import type { Metadata } from "next"
import { LinkButton } from "@/components/brand/atoms"
import { Container } from "@/components/sections/common"

export const metadata: Metadata = {
  title: { absolute: "Page not found — Cactus Peak" },
  description:
    "This page moved or never existed. Search the site or go to a club page.",
}

export default function NotFound() {
  return (
    <Container className="py-section lg:py-section-l">
      <svg viewBox="0 0 256 256" className="size-24" aria-hidden="true">
        <path
          fill="var(--color-1)"
          d="M12.53,230L12.53,222L42,170.96L42,230ZM58,230L58,143.24L88,91.28L88,230ZM104,230L104,63.57L128,22L152,63.57L152,230ZM168,230L168,91.28L198,143.24L198,230ZM214,230L214,170.96L243.47,222L243.47,230Z"
        />
      </svg>
      <h1 className="font-display-wide mt-l text-display-m lg:text-display-xl font-heavy lg:font-heavy">
        That page took a rest day.
      </h1>
      <p className="mt-s text-body-m text-muted-foreground">
        We could not find it. Try one of these.
      </p>
      <div className="mt-l flex flex-wrap gap-s">
        <LinkButton href="/clubs" size="lg">
          Find a club
        </LinkButton>
        <LinkButton href="/classes#schedule" variant="outline" size="lg">
          See the schedule
        </LinkButton>
        <LinkButton href="/search" variant="ghost" size="lg">
          Search
        </LinkButton>
      </div>
    </Container>
  )
}
