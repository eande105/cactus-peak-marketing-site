import Link from "next/link"

import { TextLink } from "@/components/brand/atoms"
import { GymObject, type ObjectId } from "@/components/brand/graphics"
import { journalObject } from "@/components/brand/journal-art"
import type { Job, JournalEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

// The titles of the About page's "The rule we kept." steps, with the same objects. The About page holds the
// line under each one.
const RULES: { title: string; icon: ObjectId }[] = [
  { title: "Nobody gets shamed.", icon: "heart-watch" },
  { title: "A first visit is free.", icon: "pass" },
  { title: "Coaches know your name.", icon: "whistle" },
  { title: "No shortcuts.", icon: "stopwatch" },
]

/**
 * Home story band body: who runs the clubs, in two halves. On the left, the four rules from the About page
 * as titles only, and the open roles. On the right, the three newest Journal notes as rows: the note's object
 * on a Night disc, the title and how long it takes to read. The band head links to /about.
 */
export function HomeStory({
  journal,
  jobs,
  className,
}: {
  journal: JournalEntry[]
  jobs: Job[]
  className?: string
}) {
  const notes = [...journal]
    .sort((a, b) => b.iso.localeCompare(a.iso))
    .slice(0, 3)
  return (
    <div className={cn("grid gap-16 lg:grid-cols-12", className)}>
      <div className="lg:col-span-5">
        <h3 className="font-display-wide flex min-h-11 items-center text-h3">
          The rule we kept
        </h3>
        <ol className="mt-6 rule-t">
          {RULES.map((r) => (
            <li key={r.title} className="flex items-center gap-4 py-4 rule-b">
              <GymObject id={r.icon} className="size-8 shrink-0" />
              <span className="font-display-wide text-h3 text-balance">
                {r.title}
              </span>
            </li>
          ))}
        </ol>
        {jobs.length ? (
          <TextLink href="/careers" className="mt-4">
            {`Work with us: ${jobs.length} open roles`}
          </TextLink>
        ) : null}
      </div>

      <div className="lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6">
          <h3 className="font-display-wide text-h3">From the Journal</h3>
          <TextLink href="/journal">Read the Journal</TextLink>
        </div>
        <ul className="mt-6 rule-t">
          {notes.map((p) => (
            <li key={p.slug} className="group relative rule-b">
              <div className="flex items-center gap-5 py-5">
                {/* Decorative: the title names the note. */}
                <span
                  aria-hidden="true"
                  className="grid size-14 shrink-0 place-items-center rounded-full bg-night"
                >
                  <GymObject
                    id={journalObject(p.slug)}
                    scheme="night"
                    className="size-8"
                  />
                </span>
                <div className="min-w-0">
                  <h4 className="text-lead font-semibold text-balance">
                    {/* The title is the one link. Its ::after covers the row. */}
                    <Link
                      href={`/journal/${p.slug}`}
                      className="no-underline underline-offset-4 group-hover:underline after:absolute after:inset-0"
                    >
                      {p.title}
                    </Link>
                  </h4>
                  <p className="tabular mt-1 text-caption text-muted-foreground">
                    {p.cat} · {p.min} min read
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
