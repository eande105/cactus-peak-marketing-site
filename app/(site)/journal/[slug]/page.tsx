import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment } from "react"
import { LinkButton, SectionHead, TextLink } from "@/components/brand/atoms"
import { CoachAvatar } from "@/components/brand/class-parts"
import { JournalArt } from "@/components/brand/journal-art"
import { ArrowLeft } from "@/components/icons"
import {
  Band,
  Container,
  JsonLd,
  TourCTABand,
} from "@/components/sections/common"
import {
  NoteAuthor,
  NoteClass,
  ReadingLine,
} from "@/components/sections/detail-parts"
import { NOTE_FIGURES } from "@/components/sections/journal-figures"
import { JournalCard } from "@/components/sections/journal-parts"
import { ShareButton } from "@/components/sections/small-client"
import { getCatalog } from "@/lib/catalog/server"
import { cn } from "@/lib/utils"

export const dynamicParams = false
export async function generateStaticParams() {
  const { journal } = await getCatalog()
  return journal.map((p) => ({ slug: p.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = (await getCatalog()).journal.find((x) => x.slug === slug)
  return p
    ? { title: `${p.title} — Cactus Peak Journal`, description: p.dek }
    : {}
}

/**
 * One Journal note. The header is a blog header: the topic, title, line and byline in one reading column, the
 * note's picture wide under them, and a reading line (date, one mark a part, read time) in place of a facts panel.
 * The body is one reading column of numbered parts with the note's figures between them (journal-figures.tsx). The
 * outline column shows only on a long note. The page closes on the site's bands and the tour panel.
 */
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { journal, classBySlug, coachBySlug } = await getCatalog()
  const p = journal.find((x) => x.slug === slug)
  if (!p) notFound()
  const author = coachBySlug(p.author)
  const a = author ?? {
    name: "Cactus Peak coaches",
    slug: "",
    credential: "",
    profile: false,
  }
  const cls = classBySlug(p.cls)
  const sections = p.sections
  const figures = NOTE_FIGURES[p.slug] ?? []
  // A short note (most of them: five short parts) reads in one column with no outline beside it.
  const longRead = sections.length > 6 || p.min >= 10
  const related = journal.filter((x) => x.slug !== p.slug).slice(0, 3)
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          author: { "@type": "Person", name: a.name },
          datePublished: p.iso,
        }}
      />

      {/* A blog header: one reading column for the title, the line and the byline, then the note's picture wide. */}
      <section aria-labelledby="note-title" className="rule-b">
        <Container className="pt-l pb-xxl lg:pt-xxl lg:pb-section">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/journal"
              className={cn(
                "flex min-h-11 w-fit items-center gap-xs",
                "mb-l",
                "text-body-s underline-offset-4 font-heavy",
                "text-link",
                "hover:underline"
              )}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              The Journal
            </Link>
            <p className="inline-flex corner-full bg-muted px-s py-xxs text-body-s font-heavy">
              {p.cat}
            </p>
            <h1
              id="note-title"
              className="display-lead mt-m max-w-[20ch] text-balance"
            >
              {p.title}
            </h1>
            <p className="lede mt-l max-w-[46ch] text-pretty text-muted-foreground lg:mt-l">
              {p.dek}
            </p>
            <div className="mt-xl flex flex-wrap items-center justify-between gap-m">
              <div className="flex items-center gap-s">
                <CoachAvatar slug={a.slug} name={a.name} size={44} />
                <p>
                  <span className="block text-body-m font-heavy">
                    {a.profile ? (
                      <Link
                        href={`/coaches/${a.slug}`}
                        className="no-underline underline-offset-4 hover:underline"
                      >
                        {a.name}
                      </Link>
                    ) : (
                      a.name
                    )}
                  </span>
                  {a.credential ? (
                    <span className="block text-body-s text-muted-foreground">
                      {a.credential}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-s">
                <ShareButton label="Share" />
              </div>
            </div>
          </div>
          <div
            className={cn(
              "max-w-5xl overflow-hidden hairline",
              "mx-auto mt-xxl corner-xl",
              "ring-border",
              "lg:mt-xxl"
            )}
          >
            <JournalArt
              slug={p.slug}
              ratio="21/9"
              className="block w-full max-sm:hidden"
            />
            <JournalArt
              slug={p.slug}
              ratio="3/2"
              className="block w-full sm:hidden"
            />
          </div>
          <ReadingLine
            date={p.date}
            iso={p.iso}
            min={p.min}
            parts={sections.map(([h]) => h)}
          />
        </Container>
      </section>

      <Container
        className={cn(
          "py-xxl lg:py-[calc(var(--space-xxl)*5/3)]",
          longRead && "grid gap-xl lg:grid-cols-12"
        )}
      >
        {/* The outline only earns its column on a long note. A short one has the reading line's part marks. */}
        {longRead ? (
          <nav
            aria-label="In this note"
            className="hidden lg:col-span-3 lg:block"
          >
            <div className="sticky top-[calc(var(--sticky-top)+1.5rem)]">
              <p className="text-body-s text-muted-foreground font-heavy">
                In this note
              </p>
              <ol className="mt-m rule-t rule-heavy">
                {sections.map(([h], i) => (
                  <li key={h} className="rule-b">
                    <a
                      className={cn(
                        "flex min-h-11 items-baseline gap-s",
                        "py-xs",
                        "text-body-s no-underline",
                        "hover:underline"
                      )}
                      href={`#s${i + 1}`}
                    >
                      <span className="tabular font-data font-heavy">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {h}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        ) : null}
        <article
          className={cn(
            longRead
              ? "max-w-[680px] lg:col-span-8 lg:col-start-5"
              : "mx-auto max-w-3xl"
          )}
        >
          {sections.map(([h, t], i) => (
            <Fragment key={h}>
              <section
                id={`s${i + 1}`}
                className="scroll-mt-4 pt-l pb-xxl rule-t rule-heavy"
              >
                <span
                  aria-hidden="true"
                  className="tabular font-data text-display-l font-heavy"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display-wide mt-m text-body-xxl text-balance font-heavy">
                  {h}
                </h2>
                <p className="mt-m max-w-[62ch] text-body-l text-pretty">{t}</p>
                {i === 1 && cls ? (
                  <div className="mt-xl max-w-lg">
                    <NoteClass ct={cls} />
                  </div>
                ) : null}
              </section>
              {figures
                .filter((f) => f.after === i)
                .map((f) => (
                  <div key={f.figure.name} className="-mt-m mb-xxl">
                    <f.figure />
                  </div>
                ))}
            </Fragment>
          ))}

          <NoteAuthor author={a} />

          {/* The one trial action in the note, in the coach finder's "Not sure who fits?" form. */}
          <aside
            aria-labelledby="note-trial-title"
            className={cn(
              "grid gap-l",
              "mt-l corner-m p-l",
              "bg-[var(--cat-strength)] text-neutral-1",
              "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center [&_:focus-visible]:outline-[var(--neutral-1)]"
            )}
          >
            <div>
              <h2
                id="note-trial-title"
                className="font-display-wide text-body-l font-medium"
              >
                {cls ? `Try ${cls.name} free.` : "Try a class free."}
              </h2>
              <p className="mt-xxs text-body-m">
                A 3-day pass. One club, any class with room. No card.
              </p>
            </div>
            <LinkButton
              href="/trial"
              className="bg-night text-night-foreground ring-night hover:bg-night/90"
            >
              Try a free 3-day pass
            </LinkButton>
          </aside>
        </article>
      </Container>

      <Band tone="tint" id="more">
        <SectionHead
          size="lead"
          title="Keep reading."
          action={<TextLink href="/journal">Every note</TextLink>}
        />
        <ul className="mt-xxl grid gap-x-xl gap-y-xxl sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <li key={r.slug}>
              <JournalCard p={r} />
            </li>
          ))}
        </ul>
      </Band>

      <TourCTABand
        night
        title={cls ? `Try ${cls.name} on a tour.` : "Come see the club."}
        support="A 30-minute tour. Tell the coach it is your first class. No card."
        passEmail
      />
    </>
  )
}
