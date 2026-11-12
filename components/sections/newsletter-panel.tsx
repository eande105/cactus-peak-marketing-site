import {
  BrandMark,
  GymObject,
  type ObjectId,
} from "@/components/brand/graphics"
import { journalObject } from "@/components/brand/journal-art"
import type { JournalEntry } from "@/lib/types"
import { cn } from "@/lib/utils"
import { panelContent, panelFrame } from "./common"
import { NewsletterStrip } from "./small-client"

/** What a subscriber gets: a title only, because each one is plain from its name. */
const PERKS: { title: string; icon: ObjectId }[] = [
  { title: "One email a month", icon: "calendar" },
  { title: "Written by coaches", icon: "whistle" },
  { title: "No spam", icon: "envelope" },
]

/**
 * The Journal's closing panel, in place of the tour panel: the same inset shape as the tour panel, but on Night,
 * so the two never read as one. It follows the sign-up blocks of real publication sites: the promise as the
 * headline, one line, the email field and the action on one line, three short perks, and beside it a preview of
 * the next email (sender, subject and the notes in it), so a visitor sees what lands in the inbox before they
 * subscribe. The preview is decorative: the notes in it are on the page above.
 */
export function NewsletterPanel({
  id,
  notes,
}: {
  id: string
  notes: JournalEntry[]
}) {
  const [lead, ...rest] = notes
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(panelFrame, "scroll-mt-4 pt-2 sm:pt-3")}
    >
      <div className="overflow-hidden rounded-2xl bg-night text-night-foreground">
        <div className={cn(panelContent, "py-12 lg:py-20")}>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <span
                aria-hidden="true"
                className="grid size-14 place-items-center rounded-full bg-[var(--cat-strength)]"
              >
                <BrandMark scheme="copper" className="size-8" />
              </span>
              <h2 id={`${id}-title`} className="display-lead mt-6 text-balance">
                One good note a month.
              </h2>
              <p className="mt-4 max-w-[44ch] text-lead text-pretty text-night-muted">
                Training notes from our coaches and news from the clubs, in your
                inbox. Leave any time.
              </p>
              <div className="mt-8 max-w-[34rem]">
                <NewsletterStrip />
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 pt-6 text-label rule-t rule-night">
                {PERKS.map((p) => (
                  <li key={p.title} className="flex items-center gap-2">
                    <GymObject id={p.icon} scheme="night" className="size-6" />
                    {p.title}
                  </li>
                ))}
              </ul>
            </div>

            {lead ? (
              // The next email, as it would sit in an inbox: a card on a second card, tilted a little from lg.
              <div aria-hidden="true" className="relative lg:col-span-6">
                <div className="absolute inset-x-6 top-6 -bottom-3 rounded-2xl bg-night-fill lg:rotate-3" />
                <div className="relative rounded-2xl bg-card text-foreground shadow-[0_24px_60px_-20px_rgb(0_0_0/0.5)] lg:-rotate-1">
                  <div className="flex items-center gap-3 px-5 py-4 rule-b">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-night">
                      <GymObject
                        id="squat-rack"
                        scheme="night"
                        className="size-6"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-label">Cactus Peak Journal</p>
                      <p className="truncate text-caption text-muted-foreground">
                        {lead.title}
                      </p>
                    </div>
                    <span className="text-caption text-muted-foreground">
                      Monthly
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                      <span className="grid size-16 shrink-0 place-items-center rounded-full bg-night">
                        <GymObject
                          id={journalObject(lead.slug)}
                          scheme="night"
                          className="size-10"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="text-caption text-muted-foreground">
                          {lead.cat} · {lead.min} min read
                        </p>
                        <p className="font-display-wide text-h3 text-balance">
                          {lead.title}
                        </p>
                      </div>
                    </div>
                    <p className="mt-5 text-caption text-muted-foreground">
                      Also in this email
                    </p>
                    <ul className="mt-2">
                      {rest.slice(0, 3).map((n) => (
                        <li
                          key={n.slug}
                          className="flex items-center gap-3 py-3 rule-t"
                        >
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
                            <GymObject
                              id={journalObject(n.slug)}
                              className="size-5"
                            />
                          </span>
                          <span className="truncate text-label">{n.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
