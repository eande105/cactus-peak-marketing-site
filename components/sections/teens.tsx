import Link from "next/link"
import { LinkButton, TextLink } from "@/components/brand/atoms"
import {
  classObjects,
  GymObject,
  type ObjectId,
} from "@/components/brand/graphics"
import { timesByClub } from "@/lib/class-times"
import { classHref } from "@/lib/links"
import type { ClassType, Club, Slot } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ShareButton } from "./small-client"

/*
 * Teens on the kids page, laid out like kids club and swim school above it: a picture of how it works, then the
 * steps. The picture is what opens up as a teen grows (the teen rules in 00-foundation.md section 4 and the site
 * FAQ), as steps that rise from 13 to 18. Beside it, Teen Strength, the class built for them. Under both, how a
 * teen gets started.
 */

/**
 * What opens at each age. From sm the steps rise with the age (height); on a phone they turn sideways and grow
 * wider instead (width), because four columns are too narrow for the words there.
 */
const AGES: {
  age: string
  height: string
  width: string
  items: { icon: ObjectId; text: string }[]
}[] = [
  {
    age: "13",
    height: "sm:h-[72%]",
    width: "max-sm:w-[76%]",
    items: [
      { icon: "dumbbell", text: "Classes marked Teen OK" },
      { icon: "paddle", text: "Courts, if you allow it" },
    ],
  },
  {
    age: "14",
    height: "sm:h-[80%]",
    width: "max-sm:w-[84%]",
    items: [{ icon: "pool", text: "Lap lanes, if you allow it" }],
  },
  {
    age: "16",
    height: "sm:h-[90%]",
    width: "max-sm:w-[92%]",
    items: [{ icon: "squat-rack", text: "The strength floor without a coach" }],
  },
  {
    age: "18",
    height: "sm:h-full",
    width: "max-sm:w-full",
    items: [{ icon: "spa-stones", text: "Sauna and cold plunge" }],
  },
]

const start = (childPrice: number): { title: string; text?: string }[] => [
  {
    title: "Add your teen to your plan",
    text: `$${childPrice} a month, the same child add-on as younger kids.`,
  },
  { title: "Sign the waiver" },
  {
    title: "Your teen books in the app",
    text: "Any class marked Teen OK. You manage the billing.",
  },
]

export function TeensGuide({
  teenClass,
  clubs,
  slots,
  childPrice,
}: {
  teenClass: ClassType | undefined
  clubs: Club[]
  slots: Slot[]
  childPrice: number
}) {
  const times = teenClass ? timesByClub(slots, teenClass.key, clubs) : []
  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* What opens up with age: rising steps, the last one lit (adult access). */}
        <section
          aria-labelledby="teen-ages"
          className="rounded-lg bg-card p-6 edge ring-border lg:col-span-7 lg:p-8"
        >
          <h3 id="teen-ages" className="font-display-wide text-h3">
            What opens up with age
          </h3>
          <ol className="mt-6 flex flex-col gap-1.5 sm:grid sm:h-96 sm:grid-cols-4 sm:items-end sm:gap-2">
            {AGES.map((a, i) => {
              const lit = i === AGES.length - 1
              return (
                <li key={a.age} className={cn("min-h-0", a.height, a.width)}>
                  <div
                    className={cn(
                      "flex h-full items-center gap-4 rounded-md p-3 sm:flex-col sm:items-stretch sm:justify-between sm:gap-0 sm:rounded-t-2xl sm:rounded-b-md sm:p-4",
                      lit
                        ? "bg-[var(--cat-strength)] text-[var(--neutral-1)]"
                        : "bg-night text-night-foreground"
                    )}
                  >
                    <span className="tabular w-10 shrink-0 font-data text-h2 leading-none font-bold sm:w-auto sm:text-h1">
                      {a.age}
                      <span className="sr-only">: </span>
                    </span>
                    <ul className="flex flex-col gap-2">
                      {a.items.map((it) => (
                        <li
                          key={it.text}
                          className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1.5"
                        >
                          <GymObject
                            id={it.icon}
                            scheme={lit ? "copper" : "night"}
                            className="size-6 sm:size-7"
                          />
                          <span className="text-label font-semibold text-pretty">
                            {it.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        {/* The class built for teens. */}
        {teenClass ? (
          <section
            aria-labelledby="teen-class"
            className="flex flex-col gap-5 lg:col-span-5"
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="grid size-14 shrink-0 place-items-center rounded-md bg-night"
              >
                <GymObject
                  id={classObjects[teenClass.slug] ?? "dumbbell"}
                  scheme="night"
                  className="size-9"
                />
              </span>
              <h3 id="teen-class" className="font-display-wide text-h3">
                <Link
                  href={classHref(teenClass)}
                  className="no-underline underline-offset-4 hover:underline"
                >
                  {teenClass.name}
                </Link>
              </h3>
            </div>
            <p className="text-lead text-pretty">{teenClass.blurb}</p>
            <dl className="grid grid-cols-3 rule-y">
              {[
                { k: "Ages", v: "13–17" },
                { k: "Class", v: `${teenClass.duration} min` },
                { k: "Group", v: teenClass.group },
              ].map((f, i) => (
                <div key={f.k} className={cn("py-4", i > 0 && "pl-4 rule-l")}>
                  <dt className="text-label text-muted-foreground">{f.k}</dt>
                  <dd className="font-display-wide mt-1 text-h3 tabular-nums">
                    {f.v}
                  </dd>
                </div>
              ))}
            </dl>
            {times.length ? (
              <ul className="flex flex-col gap-1 text-body">
                {times.map((t) => (
                  <li key={t.club.slug} className="tabular-nums">
                    <span className="font-semibold">{t.club.short}:</span>{" "}
                    {t.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </div>

      {/* How a teen gets started. */}
      <section aria-labelledby="teen-start">
        <h3 id="teen-start" className="font-display-wide text-h3">
          Getting started
        </h3>
        <ol className="mt-5 grid gap-6 sm:grid-cols-3">
          {start(childPrice).map((s, i) => (
            <li key={s.title} className="pt-3 rule-t rule-heavy">
              <span
                aria-hidden="true"
                className="tabular font-data text-h3 font-bold"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-body-strong">{s.title}</p>
              {s.text ? (
                <p className="mt-1 text-body text-pretty text-muted-foreground">
                  {s.text}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <LinkButton href="/tour?note=kids">Book a free tour</LinkButton>
          <ShareButton />
          <TextLink href="/legal/kids-club-policy">Teen rules</TextLink>
        </div>
      </section>
    </div>
  )
}
