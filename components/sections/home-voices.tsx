import { GymObject, type ObjectId } from "@/components/brand/graphics"
import { initials } from "@/lib/catalog"
import type { ClubQuote, Testimonial } from "@/lib/types"
import { cn } from "@/lib/utils"

type Voice = { quote: string; who: string; detail: string }

// Each member gets the object for what they do at the club, so the wall reads as the range of members
// without photos. Order matters: the more specific word is tested first ("warm pool" before "pool",
// "cycle" before "lift", so a member who does both gets the object no one else has).
const voiceIcons: [RegExp, ObjectId][] = [
  [/warm pool/i, "wave"],
  [/swim/i, "pool"],
  [/pickleball|court/i, "paddle"],
  [/platform/i, "barbell"],
  [/cycle/i, "spin-bike"],
  [/lift/i, "barbell"],
  [/strength/i, "kettlebell"],
]
export const voiceIcon = (q: string): ObjectId =>
  voiceIcons.find(([re]) => re.test(q))?.[1] ?? "sneaker"

/** The member's mark: initials on Night, as the brand sets coach avatars (VISUAL-IDENTITY.md, section 6). */
export function Mark({ who, className }: { who: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-11 shrink-0 place-items-center",
        "corner-full",
        "text-body-s font-heavy",
        "bg-night text-night-foreground",
        className
      )}
    >
      {initials(who)}
    </span>
  )
}

/**
 * Home member voices: one lead story set large, then every other quote on a ruled wall
 * (references: the HoneyBook member spotlight and the Superpower "Hear it from our members" wall on
 * Mobbin). Every quote is in view, with no carousel and no cards, like the classes and membership
 * sections above. One quote per member: a member with a second quote shows once. The wall keeps four
 * quotes, two rows of two, so the section stays near one screen on a phone.
 */
export function HomeVoices({
  testimonials,
  clubQuotes,
  className,
}: {
  testimonials: Testimonial[]
  clubQuotes: ClubQuote[]
  className?: string
}) {
  const seen = new Set<string>()
  const voices: Voice[] = [
    ...testimonials.map((t) => ({
      quote: t.quote,
      who: t.who,
      detail: `${t.goal} · ${t.club}`,
    })),
    ...clubQuotes.map((q) => ({ quote: q.quote, who: q.who, detail: q.goal })),
  ].filter((v) => !seen.has(v.who) && seen.add(v.who))
  const [lead, ...others] = voices
  const rest = others.slice(0, 4)
  if (!lead) return null

  return (
    <div
      className={cn(
        "grid gap-xxl lg:grid-cols-12 lg:gap-section",
        className
      )}
    >
      <figure className="lg:col-span-5">
        <GymObject id={voiceIcon(lead.quote)} className="size-12" />
        <blockquote className="font-display-wide mt-l text-body-xxl text-balance lg:text-display-m font-heavy lg:font-heavy">
          “{lead.quote}”
        </blockquote>
        <figcaption className="mt-xl flex items-center gap-m">
          <Mark who={lead.who} />
          <span>
            <span className="block text-body-m font-heavy">{lead.who}</span>
            <span className="block text-body-s text-muted-foreground">
              {lead.detail}
            </span>
          </span>
        </figcaption>
      </figure>

      {/* The wall: two columns that fill top to bottom, each quote under a rule. */}
      <ul className="gap-x-xxl sm:columns-2 lg:col-span-7">
        {rest.map((v) => (
          <li key={v.who} className="mb-xl break-inside-avoid pt-l rule-t">
            <figure>
              <GymObject id={voiceIcon(v.quote)} className="size-7" />
              <blockquote className="mt-m text-body-l text-pretty">
                “{v.quote}”
              </blockquote>
              <figcaption className="mt-m flex items-center gap-s">
                <Mark who={v.who} className="size-9 text-body-s" />
                <span>
                  <span className="block text-body-s font-heavy">{v.who}</span>
                  <span className="block text-body-s text-muted-foreground">
                    {v.detail}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}
