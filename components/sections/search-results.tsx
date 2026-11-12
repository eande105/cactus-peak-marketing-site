"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { useCatalog } from "@/components/site/catalog-context"
import { useMyClub } from "@/components/site/club-context"
import { buildIndex, runSearch } from "@/components/site/search-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "./common"

export function SearchResults() {
  const q = useSearchParams().get("q") ?? ""
  const catalog = useCatalog()
  const { club: mine } = useMyClub()
  const index = useMemo(() => buildIndex(catalog), [catalog])
  const hits = useMemo(() => runSearch(q, index, mine?.slug), [q, index, mine])
  const groups = [...new Set(hits.map((h) => h.group))]
  return (
    <div>
      <h1 className="font-display-wide text-display-m lg:text-display-xl font-heavy lg:font-heavy">
        {q ? `Results for “${q}”` : "Search"}
      </h1>
      {/* A plain GET form, so the page can search without the header dialog and without JavaScript. */}
      <search>
        <form action="/search" className="mt-m flex max-w-xl gap-xs">
          <label htmlFor="search-page-q" className="sr-only">
            Search clubs, classes, coaches
          </label>
          <Input
            id="search-page-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search clubs, classes, coaches…"
            className="flex-1 bg-card"
          />
          <Button type="submit">Search</Button>
        </form>
      </search>
      {/* No count before a search: "0 results" would read as a failed search. */}
      <p
        className="tabular mt-xs text-body-s text-muted-foreground"
        aria-live="polite"
      >
        {q ? (hits.length === 1 ? "1 result" : `${hits.length} results`) : ""}
      </p>
      {q && !hits.length ? (
        <EmptyState
          className="mt-l"
          title={`We found nothing for “${q}”.`}
          text="Try “cycle”, “pool” or “kids club”."
        >
          <LinkButton href="/classes" variant="outline">
            See all classes
          </LinkButton>
          <LinkButton href="/contact" variant="ghost">
            Ask a person
          </LinkButton>
        </EmptyState>
      ) : null}
      {groups.map((g) => (
        <section key={g} className="mt-xl">
          <h2 className="eyebrow mb-xs">{g}</h2>
          <ul className="rule-t">
            {hits
              .filter((h) => h.group === g)
              .map((h) => (
                <li key={h.href + h.title} className="rule-b">
                  <Link
                    href={h.href}
                    className="flex min-h-14 items-center gap-s py-xs hover:underline"
                  >
                    <span className="flex w-10 justify-center">{h.lead}</span>
                    <span>
                      <span className="block text-body-s font-heavy">
                        {h.title}
                      </span>
                      <span className="block text-body-s text-muted-foreground">
                        {h.sub}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
