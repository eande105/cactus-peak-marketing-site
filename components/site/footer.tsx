import Link from "next/link"
import { getCatalog } from "@/lib/catalog/server"
import { PHONE_HOURS_MIN } from "@/lib/labels"
import { fmtClock, WEEKDAY_HOURS, WEEKEND_HOURS } from "@/lib/time"
import { cn } from "@/lib/utils"
import { ClubsOpenStatus } from "./live-status"
import { Logo } from "./logo"

// Four short columns, one job each, in the header's order: Clubs, then what you can do there, then how to join,
// then the brand. The header and the pages carry the detail; the footer is the index of every page.
// Each column starts with its overview page, the same as the header's Clubs menu.
const train = [
  ["/classes", "Classes"],
  // The schedule is a section of the classes page. It has no header item, so the footer names it.
  ["/classes#schedule", "Class schedule"],
  ["/personal-training", "Personal training"],
  ["/kids", "Kids & family"],
  // The facility pages have no header item: the club pages and the class rows link them. The footer is the
  // only fixed place that lists them.
  ["/aquatics", "Pools & swim"],
  ["/courts", "Courts"],
  ["/recovery", "Recovery"],
]
const membership = [
  ["/membership", "Plans & prices"],
  // A family shares one plan on one account, so the family section is a price, not a set of plans.
  ["/membership#family", "Family pricing"],
  // The day pass is one row of the costs section, next to enrollment, the facility fee and the freeze.
  ["/membership#costs", "Fees & day pass"],
  ["/trial", "Free 3-day pass"],
  ["/tour", "Book a free tour"],
]
const about = [
  ["/about", "Our story"],
  ["/coaches", "Coaches"],
  ["/journal", "Journal"],
  ["/careers", "Careers"],
  ["/faq", "FAQ"],
  ["/contact", "Contact"],
]
/** The club rows of the footer hours table. All five clubs keep the same hours. */
const HOURS = [
  ["Weekdays", WEEKDAY_HOURS],
  ["Weekends", WEEKEND_HOURS],
] as const

/** One row of the hours table: the day name, then the opening and closing times in their own columns. */
function HoursRow({
  day,
  hours: [open, close],
  className,
}: {
  day: string
  hours: readonly [number, number]
  className?: string
}) {
  return (
    <tr>
      <th scope="row" className={cn("py-xxs font-regular", className)}>
        {day}
      </th>
      {[open, close].map((min, i) => (
        <td
          key={i === 0 ? "open" : "close"}
          className={cn("py-xxs pl-m text-right", className)}
        >
          {fmtClock(min)}
        </td>
      ))}
    </tr>
  )
}
const legal = [
  ["/legal/privacy", "Privacy"],
  ["/legal/terms", "Terms"],
  ["/legal/membership-agreement", "Membership agreement"],
  ["/legal/cookies", "Cookies"],
  ["/legal/accessibility", "Accessibility"],
  ["/legal/sms-terms", "SMS terms"],
]

const Instagram = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </svg>
)
const Facebook = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z" />
  </svg>
)
const Youtube = (p: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="m10 9 5 3-5 3z" />
  </svg>
)
/**
 * Social profile URLs. Empty until the brand has real accounts: an icon shows only when its URL is set,
 * so no placeholder link ships.
 */
const SOCIAL_LINKS = { Instagram: "", Facebook: "", YouTube: "" }
const socials = (
  [
    [Instagram, "Instagram"],
    [Facebook, "Facebook"],
    [Youtube, "YouTube"],
  ] as const
).flatMap(([icon, name]) =>
  SOCIAL_LINKS[name] ? [[icon, name, SOCIAL_LINKS[name]] as const] : []
)
const L = ({ h, children }: { h: string; children: React.ReactNode }) =>
  h.startsWith("http") ? (
    <a
      href={h}
      className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
    >
      {children}
    </a>
  ) : (
    <Link
      href={h}
      className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  )
function Column({ title, items }: { title: string; items: string[][] }) {
  return (
    <div>
      <h2 className="text-body-s text-night-muted font-heavy">{title}</h2>
      <ul className="mt-s">
        {items.map(([h, l]) => (
          <li key={h + l}>
            <L h={h}>{l}</L>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The site footer: an inset Night panel the width of the page less the gutter, wider than the Home tour
 * panel above it, so the two read as different things. Its content fills most of the panel: the inset
 * grows with the screen, as in the Home hero. It is a plain index:
 * one contact block (the member services line, and one hours table for the clubs and the phone line), four short link
 * columns, then the legal row. Club addresses, phones and the full hours table live on
 * the club pages and /contact, so the footer does not repeat them five times
 * (references: the Attio and Pinterest footers on Mobbin: the logo at the top left, a quiet legal row last).
 */
export async function SiteFooter() {
  const { clubs } = await getCatalog()
  return (
    <footer className="px-xs pt-xl pb-xs sm:px-s sm:pb-s lg:pt-xxl">
      <div className="overflow-hidden corner-xl bg-night text-night-foreground">
        <div
          className={cn(
            "w-full",
            "px-m pt-xxl",
            "sm:px-l lg:px-xxl lg:pt-section xl:px-section min-[100rem]:px-section-l"
          )}
        >
          <div className="grid gap-xxl lg:grid-cols-12 lg:gap-xl">
            <div className="lg:col-span-4">
              {/* The logo at its normal size, at the head of the contact column, with the tagline under it. */}
              <Logo reversed width={200} />
              <p className="mt-s text-body-l text-night-muted">
                Climb at your own pace.
              </p>
              {/* Two text styles only: the muted label for names and column heads, and body text for the values.
                  The hours are a table, so each time sits in its own column and no dash is needed between them. */}
              <div className="mt-xl grid gap-l text-body-m">
                <div>
                  <p className="text-body-s text-night-muted font-heavy">
                    Member services
                  </p>
                  <a
                    href="tel:+14805550100"
                    className="tabular inline-flex min-h-11 items-center underline underline-offset-4"
                  >
                    (480) 555-0100
                  </a>
                </div>
                <div>
                  <table className="tabular w-full max-w-72 text-left">
                    <caption className="sr-only">
                      Hours at every club, and for member services calls
                    </caption>
                    <thead className="text-body-s text-night-muted font-heavy">
                      <tr>
                        {/* The live status takes the empty corner cell, above the day names. It is a plain cell, not a
                            column head, so a screen reader does not read it before each day. */}
                        <td className="pb-xs">
                          <ClubsOpenStatus />
                        </td>
                        <th scope="col" className="pb-xs text-right">
                          Opens
                        </th>
                        <th scope="col" className="pb-xs text-right">
                          Closes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&>tr:last-child>*]:pb-m">
                      {HOURS.map(([day, hours]) => (
                        <HoursRow key={day} day={day} hours={hours} />
                      ))}
                    </tbody>
                    {/* The phone line keeps other hours, so a rule sets it apart from the club rows. */}
                    <tbody className="[&>tr:first-child>*]:rule-t [&>tr:first-child>*]:rule-night">
                      <HoursRow
                        day="Phone, daily"
                        hours={PHONE_HOURS_MIN}
                        className="pt-m"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-xl flex flex-wrap items-center gap-s">
                <a
                  href="https://apps.apple.com/"
                  className={cn(
                    "inline-flex min-h-11 items-center",
                    "corner-s px-m",
                    "text-body-s font-heavy",
                    "bg-night-foreground text-foreground"
                  )}
                >
                  Download on the App Store
                </a>
                <Link
                  href="/app"
                  className="inline-flex min-h-11 items-center text-body-s underline underline-offset-4 font-heavy"
                >
                  Members book in the app
                </Link>
                {socials.length ? (
                  // biome-ignore lint/a11y/useSemanticElements: link group, not form controls, so fieldset does not fit
                  <div
                    className="flex gap-xxs"
                    role="group"
                    aria-label="Social media"
                  >
                    {socials.map(([Icon, name, href]) => (
                      <a
                        key={name}
                        href={href}
                        aria-label={name}
                        className="inline-flex size-11 items-center justify-center corner-s hover:bg-night-fill"
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-x-l gap-y-xxl sm:grid-cols-4 lg:col-span-8"
            >
              <Column
                title="Clubs"
                items={[
                  ["/clubs", "All clubs and map"],
                  ...clubs.map((c) => [`/clubs/${c.slug}`, c.name]),
                ]}
              />
              <Column title="Train" items={train} />
              <Column title="Membership" items={membership} />
              <Column title="About" items={about} />
            </nav>
          </div>

          <div
            className={cn(
              "flex flex-col gap-s rule-t rule-night",
              "mt-xxl py-l",
              "text-body-s",
              "lg:mt-section lg:flex-row lg:items-center lg:justify-between"
            )}
          >
            <p>
              © 2026 Cactus Peak Athletic.{" "}
              <span className="text-night-muted">
                Fictional brand made for a university project.
              </span>
            </p>
            <ul className="flex flex-wrap gap-x-m">
              {legal.map(([h, l]) => (
                <li key={h}>
                  <L h={h}>{l}</L>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
