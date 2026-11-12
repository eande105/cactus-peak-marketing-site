import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { BrandMark } from "@/components/brand/graphics"
import { ArrowLeft } from "@/components/icons"
import { DEPT_OBJECT, payEnds } from "@/components/sections/about-heroes"
import { Band, Container, JsonLd } from "@/components/sections/common"
import {
  HIRE_STEPS,
  PostingLine,
  RolePay,
} from "@/components/sections/detail-parts"
import {
  NumberedSteps,
  ObjectTiles,
  ProgramRows,
  RuleList,
} from "@/components/sections/program-page"
import { ShareButton } from "@/components/sections/small-client"
import { getCatalog } from "@/lib/catalog/server"

export const dynamicParams = false
export async function generateStaticParams() {
  const { jobs } = await getCatalog()
  return jobs.map((j) => ({ slug: j.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const j = (await getCatalog()).jobs.find((x) => x.slug === slug)
  return j
    ? {
        title: `${j.title}, ${j.club} — Cactus Peak`,
        description: `${j.type} ${j.title.toLowerCase()} at ${j.club}. ${j.pay}.`,
      }
    : {}
}

/** "$22–$30 an hour" to a schema.org pay range. Returns undefined when the text has another shape. */
function payRange(pay: string) {
  const m = pay.match(/\$(\d+(?:\.\d+)?)\s*[–-]\s*\$(\d+(?:\.\d+)?)\s+an hour/i)
  if (!m) return undefined
  return {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: {
      "@type": "QuantitativeValue",
      minValue: Number(m[1]),
      maxValue: Number(m[2]),
      unitText: "HOUR",
    },
  }
}
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
/** "2026-10-26" to "Oct 26". The year is left out, because a posting is always recent. */
const postedLabel = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number)
  return `${MONTHS[m - 1]} ${d}`
}
const EMPLOYMENT: Record<string, string> = {
  "Part-time": "PART_TIME",
  "Full-time": "FULL_TIME",
  Seasonal: "TEMPORARY",
}

/**
 * One open role. The header is a posting header, like a Journal note's: the team, type, title and summary in one
 * column, a posting line (club, schedule, posted) in place of a facts panel, the actions, and then the role's
 * picture wide with its pay on the line of every open role's pay. The page goes on in lead-size heads and
 * alternating bands. It answers, in order,
 * what the work is, what you bring and get, how hiring goes, and what else is open, then ends on the apply action.
 */
export default async function Job({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { jobs, clubs } = await getCatalog()
  const j = jobs.find((x) => x.slug === slug)
  if (!j) notFound()
  const club = clubs.find((c) => c.name === j.club)
  const baseSalary = payRange(j.pay)
  const ends = jobs.map((x) => payEnds(x.pay)).filter((e) => e !== undefined)
  const low = ends.length ? Math.min(...ends.map((e) => e[0])) : 0
  const high = ends.length ? Math.max(...ends.map((e) => e[1])) : 0
  const others = jobs.filter((x) => x.slug !== j.slug)
  // There is no applicant system yet. The contact form reaches the people who hire.
  const applyHref = `/contact?topic=careers&role=${encodeURIComponent(j.slug)}${club ? `&club=${club.slug}` : ""}#message`
  const summary =
    j.summary ??
    `You will work with a small team at ${j.club}. You will help members feel welcome from the first visit, and you will keep the club safe and clean.`
  const duties = j.duties ?? [
    "Greet members by name",
    "Follow the club's safety routines",
    "Work with coaches and the desk",
  ]
  const requirements = j.requirements ?? [
    "Friendly and steady",
    "Reliable on early shifts",
    "Certifications for the role, or willing to earn them (paid)",
  ]
  const posting: [string, string, string?][] = [["Club", j.club, club?.city]]
  if (j.schedule) posting.push(["Schedule", j.schedule])
  if (j.posted) posting.push(["Posted", postedLabel(j.posted)])
  // There is no closing date in the data, so validThrough is left out rather than guessed.
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: j.title,
          hiringOrganization: {
            "@type": "Organization",
            name: "Cactus Peak Athletic",
          },
          description: [
            summary,
            ...duties,
            ...(j.schedule ? [`Schedule: ${j.schedule}`] : []),
          ].join(" "),
          jobLocation: {
            "@type": "Place",
            name: j.club,
            address: {
              "@type": "PostalAddress",
              ...(club
                ? { streetAddress: club.cross, addressLocality: club.city }
                : {}),
              addressRegion: "AZ",
              addressCountry: "US",
            },
          },
          ...(j.posted ? { datePosted: j.posted } : {}),
          employmentType: EMPLOYMENT[j.type] ?? j.type,
          ...(baseSalary ? { baseSalary } : {}),
        }}
      />

      {/* A posting header: one column for the role, its posting line and the actions, then the pay picture wide. */}
      <section aria-labelledby="job-hero-title" className="rule-b">
        <Container className="pt-6 pb-10 lg:pt-10 lg:pb-14">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/careers#roles"
              className="mb-6 flex min-h-11 w-fit items-center gap-1.5 text-label text-link underline-offset-4 hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All open roles
            </Link>
            <p className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-label">
                {j.dept}
              </span>
              <span className="inline-flex rounded-full px-3 py-1 text-label ring-1 ring-border ring-inset">
                {j.type}
              </span>
            </p>
            <h1
              id="job-hero-title"
              className="display-lead mt-4 max-w-[18ch] text-balance"
            >
              {j.title}
            </h1>
            <p className="lede mt-5 max-w-[44ch] text-pretty text-muted-foreground lg:mt-6">
              {summary}
            </p>
            <div className="mt-8 pt-5 rule-t">
              <PostingLine items={posting} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href={applyHref} size="lg" className="max-sm:flex-1">
                Apply
              </LinkButton>
              <div className="flex items-center gap-3">
                <ShareButton label="Share" />
              </div>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-5xl lg:mt-12">
            <RolePay job={j} low={low} high={high} />
          </div>
        </Container>
      </section>

      <Band tone="tint" id="work">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHead size="lead" title="The work." />
          </div>
          <RuleList
            className="lg:col-span-7"
            title="What you will do"
            items={duties}
          />
        </div>
      </Band>

      <Band id="bring">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <RuleList
            className="lg:col-span-5"
            title="What you bring"
            items={requirements}
          />
          <div className="lg:col-span-7">
            <h2 className="font-display-wide text-h3">What you get</h2>
            <ObjectTiles
              className="mt-6 lg:!grid-cols-2"
              tiles={[
                {
                  title: "Free membership for you and your family",
                  icon: "gym-bag",
                },
                { title: "Training and certifications paid", icon: "whistle" },
              ]}
            />
          </div>
        </div>
      </Band>

      <Band tone="tint" id="hire">
        <SectionHead size="lead" title="How we hire." />
        <NumberedSteps className="mt-12" steps={HIRE_STEPS} />
      </Band>

      {others.length ? (
        <Band id="more">
          <SectionHead
            size="lead"
            title="Other open roles."
            action={<TextLink href="/careers#roles">See every role</TextLink>}
          />
          <ProgramRows
            className="mt-12"
            rows={others.slice(0, 4).map((x) => ({
              key: x.slug,
              icon: DEPT_OBJECT[x.dept] ?? "whistle",
              title: x.title,
              href: `/careers/${x.slug}`,
              line: `${x.club} · ${x.type}`,
              aside: x.pay,
            }))}
          />
        </Band>
      ) : null}

      <Container className="pb-16 lg:pb-24">
        {/* The one apply action at the end, in the coach finder's "Not sure who fits?" form. */}
        <aside
          aria-labelledby="job-apply-title"
          className="grid gap-5 rounded-lg bg-card p-6 edge ring-border sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:p-8"
        >
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-md bg-[var(--cat-strength)]"
          >
            <BrandMark scheme="copper" className="size-9" />
          </span>
          <div className="min-w-0">
            <h2 id="job-apply-title" className="font-display-wide text-h3">
              Ready to apply?
            </h2>
            <p className="mt-2 max-w-[60ch] text-body text-pretty text-muted-foreground">
              Cactus Peak is an equal opportunity employer. To ask for an
              accommodation, call (480) 555-0100.
            </p>
          </div>
          <div className="sm:col-start-2 lg:col-start-auto">
            <LinkButton href={applyHref}>Apply for this role</LinkButton>
          </div>
        </aside>
      </Container>
    </>
  )
}
