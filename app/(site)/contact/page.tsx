import type { Metadata } from "next"
import Link from "next/link"
import { SectionHead, TextLink } from "@/components/brand/atoms"
import { ClubMap } from "@/components/brand/club-map"
import { ClubPin } from "@/components/brand/club-pin"
import {
  type ClubId,
  clubObjects,
  type ObjectId,
} from "@/components/brand/graphics"
import { Accessibility, Briefcase, Newspaper } from "@/components/icons"
import { ContactHero, DeskDay } from "@/components/sections/about-heroes"
import { Band, TourCTABand } from "@/components/sections/common"
import { ContactFormFromUrl } from "@/components/sections/url-init"
import { getCatalog } from "@/lib/catalog/server"
import { directionsHref } from "@/lib/geo"
import { PHONE_HOURS_MIN } from "@/lib/labels"
import { fmtClock, WEEKDAY_HOURS, WEEKEND_HOURS } from "@/lib/time"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Contact Cactus Peak — call a club or send a message",
  description:
    "Call the club for the fastest answer. A person answers 6 am–8 pm every day.",
}

const MEMBER_SERVICES = { phone: "(480) 555-0100", tel: "+14805550100" }

/** The other ways in, for a reader who is not a member with a question. */
const OTHER = [
  {
    href: "/legal/accessibility",
    label: "Accessibility feedback",
    Icon: Accessibility,
  },
  {
    href: "mailto:press@cactuspeakathletic.com",
    label: "Press: press@cactuspeakathletic.com",
    Icon: Newspaper,
  },
  { href: "/careers", label: "Careers", Icon: Briefcase },
]

/** The quiet, underlined link style the cards use for directions. */
const cardLink =
  "inline-flex min-h-11 items-center text-body-s text-link underline decoration-[color-mix(in_oklab,currentColor_40%,transparent)] underline-offset-4 hover:decoration-current font-heavy"

/**
 * Contact. The hero's picture answers the question this page gets most: when a person picks up. Then each club's
 * number, a message form with the other ways in, and the Copper tour panel. It shares the program pages' hero,
 * facts, heads and bands. It has no section nav: three short sections read top to bottom.
 */
export default async function Contact() {
  const { clubs } = await getCatalog()
  const [deskOpen, deskClose] = PHONE_HOURS_MIN
  const desk = `${fmtClock(deskOpen)}–${fmtClock(deskClose)}`
  return (
    <>
      <ContactHero
        lines={[
          {
            key: "member-services",
            name: "Member services",
            sub: "Any club",
            phone: MEMBER_SERVICES.phone,
            tel: MEMBER_SERVICES.tel,
            icon: "mark",
            lit: true,
          },
          ...clubs.map((c) => ({
            key: c.slug,
            name: c.name,
            sub: c.city,
            phone: c.phone,
            tel: c.tel,
            icon: (clubObjects[c.slug as ClubId]?.[0] ?? "whistle") as ObjectId,
          })),
        ]}
        note={`A person answers ${desk}, every day. For a medical emergency, call 911.`}
      />

      <Band tone="tint" id="hours">
        <SectionHead
          size="lead"
          title="When a person answers."
          lede="The club stays open longer than the desk. After hours, send a message."
        />
        <div className="mt-xxl">
          <DeskDay
            rows={[
              {
                day: "Monday to Friday",
                open: WEEKDAY_HOURS,
                desk: PHONE_HOURS_MIN,
              },
              {
                day: "Saturday and Sunday",
                open: WEEKEND_HOURS,
                desk: PHONE_HOURS_MIN,
              },
            ]}
          />
        </div>
      </Band>

      <Band id="visit">
        <SectionHead
          size="lead"
          title="Visit a club."
          action={<TextLink href="/clubs">See every club</TextLink>}
        />
        <ul className="mt-xxl grid gap-s sm:grid-cols-2 lg:grid-cols-5">
          {clubs.map((c) => (
            <li
              key={c.slug}
              className={cn(
                "flex flex-col gap-s hairline",
                "corner-m p-l",
                "bg-card ring-border"
              )}
            >
              <ClubPin n={c.n} />
              <h3 className="font-display-wide text-body-m font-heavy">
                <Link
                  href={`/clubs/${c.slug}`}
                  className="no-underline underline-offset-4 hover:underline"
                >
                  {c.name}
                </Link>
              </h3>
              <p className="text-body-s text-pretty text-muted-foreground">
                {c.cross}, {c.city}, AZ {c.zip}
              </p>
              <a
                href={directionsHref(c)}
                target="_blank"
                rel="noopener"
                className={cn(cardLink, "mt-auto")}
              >
                Directions
                <span className="sr-only"> to {c.name}</span>
              </a>
            </li>
          ))}
        </ul>
        <ClubMap className="mt-l h-[360px] overflow-hidden corner-m lg:h-[440px]" />
      </Band>

      <Band tone="tint" id="message">
        <div className="grid gap-xxl lg:grid-cols-12 lg:gap-section">
          <div className="lg:col-span-5">
            <SectionHead
              size="lead"
              title="Send a message."
              lede="We reply within 1 business day."
            />
            <ul className="mt-xxl rule-t rule-heavy">
              {OTHER.map(({ href, label, Icon }) => (
                <li key={href} className="rule-b">
                  <Link
                    href={href}
                    className="flex min-h-14 items-center gap-s text-body-m no-underline hover:underline"
                  >
                    <Icon className="size-5 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <ContactFormFromUrl />
          </div>
        </div>
      </Band>

      <TourCTABand
        night
        title="Or come see the club."
        support="A 30-minute tour. A coach, not a salesperson. No card."
        passEmail
      />
    </>
  )
}
