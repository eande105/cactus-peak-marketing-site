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
    <div className="flex flex-col gap-xxl">
      <div className="grid gap-xl lg:grid-cols-12 lg:gap-xxl">
        {/* What opens up with age: rising steps, the last one lit (adult access). */}
        <section
          aria-labelledby="teen-ages"
          className="corner-m bg-card p-l hairline ring-border lg:col-span-7 lg:p-xl"
        >
          <h3
            id="teen-ages"
            className="font-display-wide text-body-l font-medium"
          >
            What opens up with age
          </h3>
          <ol
            className={cn(
              "flex flex-col gap-xs",
              "mt-l",
              "sm:grid sm:h-96 sm:grid-cols-4 sm:items-end sm:gap-xs"
            )}
          >
            {AGES.map((a, i) => {
              const lit = i === AGES.length - 1
              return (
                <li key={a.age} className={cn("min-h-0", a.height, a.width)}>
                  <div
                    className={cn(
                      "flex h-full items-center gap-m",
                      "corner-s p-s",
                      "sm:flex-col sm:items-stretch sm:justify-between sm:gap-zero sm:corner-t-xl sm:corner-b-s sm:p-m",
                      lit
                        ? "bg-[var(--cat-strength)] text-neutral-1"
                        : "bg-night text-night-foreground"
                    )}
                  >
                    <span className="tabular w-10 shrink-0 font-data text-body-xxl leading-none font-heavy sm:w-auto sm:text-display-m">
                      {a.age}
                      <span className="sr-only">: </span>
                    </span>
                    <ul className="flex flex-col gap-xs">
                      {a.items.map((it) => (
                        <li
                          key={it.text}
                          className="flex items-center gap-xs sm:flex-col sm:items-start sm:gap-xs"
                        >
                          <GymObject
                            id={it.icon}
                            scheme={lit ? "copper" : "night"}
                            className="size-6 sm:size-7"
                          />
                          <span className="text-body-s font-heavy text-pretty">
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
            className="flex flex-col gap-l lg:col-span-5"
          >
            <div className="flex items-center gap-m">
              <span
                aria-hidden="true"
                className="grid size-14 shrink-0 place-items-center corner-s bg-night"
              >
                <GymObject
                  id={classObjects[teenClass.slug] ?? "dumbbell"}
                  scheme="night"
                  className="size-9"
                />
              </span>
              <h3
                id="teen-class"
                className="font-display-wide text-body-l font-medium"
              >
                <Link
                  href={classHref(teenClass)}
                  className="no-underline underline-offset-4 hover:underline"
                >
                  {teenClass.name}
                </Link>
              </h3>
            </div>
            <p className="text-body-l text-pretty">{teenClass.blurb}</p>
            <dl className="grid grid-cols-3 rule-y">
              {[
                { k: "Ages", v: "13–17" },
                { k: "Class", v: `${teenClass.duration} min` },
                { k: "Group", v: teenClass.group },
              ].map((f, i) => (
                <div key={f.k} className={cn("py-m", i > 0 && "pl-m rule-l")}>
                  <dt className="text-body-s text-muted-foreground font-heavy">
                    {f.k}
                  </dt>
                  <dd className="font-display-wide mt-xxs text-body-l tabular-nums font-medium">
                    {f.v}
                  </dd>
                </div>
              ))}
            </dl>
            {times.length ? (
              <ul className="flex flex-col gap-xxs text-body-m">
                {times.map((t) => (
                  <li key={t.club.slug} className="tabular-nums">
                    <span className="font-heavy">{t.club.short}:</span> {t.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
      </div>

      {/* How a teen gets started. */}
      <section aria-labelledby="teen-start">
        <h3
          id="teen-start"
          className="font-display-wide text-body-l font-medium"
        >
          Getting started
        </h3>
        <ol className="mt-l grid gap-l sm:grid-cols-3">
          {start(childPrice).map((s, i) => (
            <li key={s.title} className="pt-s rule-t rule-heavy">
              <span
                aria-hidden="true"
                className="tabular font-data text-body-l font-heavy"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-xs text-body-m font-heavy">{s.title}</p>
              {s.text ? (
                <p className="mt-xxs text-body-m text-pretty text-muted-foreground">
                  {s.text}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
        <div className="mt-xl flex flex-wrap items-center gap-s">
          <LinkButton href="/tour?note=kids">Book a free tour</LinkButton>
          <ShareButton />
          <TextLink href="/legal/kids-club-policy">Teen rules</TextLink>
        </div>
      </section>
    </div>
  )
}
