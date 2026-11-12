"use client"

import Link from "next/link"
import { useState } from "react"
import { InstructorChip } from "@/components/brand/class-parts"
import { JournalArt } from "@/components/brand/journal-art"
import { useCatalog } from "@/components/site/catalog-context"
import type { JournalEntry } from "@/lib/types"
import { EmptyState } from "./common"
import { FilterBar, ResultCount, SortSelect } from "./filter-bar"
import { Tabs2 } from "./small-client"

/**
 * One note as a card, in the coach card's form: the note's object cropped large on top, then the title, one
 * line and the author. The whole card opens the note.
 */
export function JournalCard({
  p,
  headingLevel: H = "h3",
}: {
  p: JournalEntry
  headingLevel?: "h2" | "h3"
}) {
  const a = useCatalog().coachBySlug(p.author)
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-lg bg-card edge ring-border">
      <JournalArt slug={p.slug} ratio="3/2" className="block w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="tabular text-caption text-muted-foreground">
          {p.cat} · {p.date}
        </p>
        <H className="font-display-wide text-h3 text-balance">
          <Link
            href={`/journal/${p.slug}`}
            className="no-underline after:absolute after:inset-0 hover:underline"
          >
            {p.title}
          </Link>
        </H>
        <p className="line-clamp-2 text-body text-pretty text-muted-foreground">
          {p.dek}
        </p>
        <p className="mt-auto flex items-center gap-3 pt-4 text-caption text-muted-foreground rule-t">
          {a ? <InstructorChip name={a.name} slug={a.slug} size={24} /> : null}
          <span className="tabular">{p.min} min read</span>
        </p>
      </div>
    </article>
  )
}

/**
 * Every note, with the categories as tabs and the site's results toolbar under them (the count and the sort,
 * newest first by default). Under "All", the note on the hero's cover (`skip`) is left out, so the page does not
 * show it twice.
 */
export function JournalIndex({ skip }: { skip?: string }) {
  const { journal, journalCats } = useCatalog()
  const [cat, setCat] = useState("All")
  const [sort, setSort] = useState<"newest" | "short">("newest")
  const list = journal
    .filter((p) => (cat === "All" ? p.slug !== skip : p.cat === cat))
    .sort((a, b) =>
      sort === "short" ? a.min - b.min : b.iso.localeCompare(a.iso)
    )
  return (
    <div>
      <Tabs2
        label="Journal categories"
        items={journalCats.map((c) => ({ id: c, label: c }))}
        value={cat}
        onChange={setCat}
      />
      <FilterBar
        className="mt-4"
        results={
          <>
            <ResultCount shown={list.length} noun={["note", "notes"]} />
            <SortSelect
              value={sort}
              onChange={setSort}
              options={[
                { value: "newest", label: "Newest" },
                { value: "short", label: "Shortest read" },
              ]}
            />
          </>
        }
      />
      <div className="mt-10">
        {list.length ? (
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <li key={p.slug}>
                <JournalCard p={p} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nothing here yet." text="Pick another category." />
        )}
      </div>
    </div>
  )
}
