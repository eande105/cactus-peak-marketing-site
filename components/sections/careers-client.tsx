"use client"

import Link from "next/link"
import { useState } from "react"
import { LinkButton } from "@/components/brand/atoms"
import { GymObject } from "@/components/brand/graphics"
import { useCatalog } from "@/components/site/catalog-context"
import { Button } from "@/components/ui/button"
import { SelectBox } from "@/components/ui/controls"
import { Input } from "@/components/ui/input"
import { submitSignup } from "@/lib/forms/actions"
import { isEmail } from "@/lib/store"
import type { Job } from "@/lib/types"
import { DEPT_OBJECT, payEnds } from "./about-heroes"
import { EmptyState } from "./common"
import { ActiveFilters, FilterBar, ResultCount, SortSelect } from "./filter-bar"
import { Honeypot, honeypotOf } from "./flow-ui"

type JobSort = "newest" | "pay"
// A role with no posted date sorts last under "Newest". Pay sorts on the top of each role's range.
const JOB_SORTS: Record<JobSort, (a: Job, b: Job) => number> = {
  newest: (a, b) => (b.posted ?? "").localeCompare(a.posted ?? ""),
  pay: (a, b) => (payEnds(b.pay)?.[1] ?? 0) - (payEnds(a.pay)?.[1] ?? 0),
}

/**
 * Every open role, under the site's results toolbar (filter-bar.tsx): club, department and type on the left, the
 * count and the sort on the right, and a chip for each active filter.
 */
export function JobList() {
  const { jobs } = useCatalog()
  const [club, setClub] = useState("")
  const [dept, setDept] = useState("")
  const [type, setType] = useState("")
  const [email, setEmail] = useState("")
  const [state, setState] = useState<
    "idle" | "busy" | "ok" | "error" | "failed"
  >("idle")
  const [sort, setSort] = useState<JobSort>("newest")
  const list = jobs
    .filter(
      (j) =>
        (!club || j.club === club) &&
        (!dept || j.dept === dept) &&
        (!type || j.type === type)
    )
    .sort(JOB_SORTS[sort])
  const opts = (k: "club" | "dept" | "type") => [
    ...new Set(jobs.map((j) => j[k])),
  ]
  const reset = () => {
    setClub("")
    setDept("")
    setType("")
  }
  return (
    <div>
      <FilterBar
        filters={(
          [
            ["Club", club, setClub, "club"],
            ["Department", dept, setDept, "dept"],
            ["Type", type, setType, "type"],
          ] as const
        ).map(([l, v, s, k]) => (
          <SelectBox
            key={l}
            inline
            label={l}
            value={v}
            onChange={s}
            options={[
              { value: "", label: "All" },
              ...opts(k).map((o) => ({ value: o, label: o })),
            ]}
          />
        ))}
        results={
          <>
            <ResultCount
              shown={list.length}
              total={jobs.length}
              noun={["open role", "open roles"]}
            />
            <SortSelect
              value={sort}
              onChange={setSort}
              options={[
                { value: "newest", label: "Newest" },
                { value: "pay", label: "Highest pay" },
              ]}
            />
          </>
        }
      />
      <ActiveFilters
        items={[
          club && { key: "club", label: club, clear: () => setClub("") },
          dept && { key: "dept", label: dept, clear: () => setDept("") },
          type && { key: "type", label: type, clear: () => setType("") },
        ]}
        onClearAll={reset}
      />
      {list.length ? (
        <ul className="mt-l rule-b rule-rows">
          {list.map((j) => (
            <li
              key={j.slug}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-m gap-y-s py-l lg:grid-cols-12 lg:gap-x-xl"
            >
              {/* The object sits outside the heading, so the heading's name is only the title. */}
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center corner-s bg-night lg:col-span-1"
              >
                <GymObject
                  id={DEPT_OBJECT[j.dept] ?? "whistle"}
                  scheme="night"
                  className="size-8"
                />
              </span>
              <div className="min-w-0 lg:col-span-4">
                <h3 className="font-display-wide text-body-l text-balance font-medium">
                  <Link
                    href={`/careers/${j.slug}`}
                    className="no-underline underline-offset-4 hover:underline"
                  >
                    {j.title}
                  </Link>
                </h3>
                <p className="text-body-s text-muted-foreground">{j.dept}</p>
              </div>
              <p className="text-body-m max-lg:col-start-2 lg:col-span-3">
                {j.club}
                <span className="block text-body-s text-muted-foreground">
                  {j.type}
                </span>
              </p>
              <p className="tabular text-body-m max-lg:col-start-2 lg:col-span-2 font-heavy">
                {j.pay}
              </p>
              <div className="max-lg:col-start-2 lg:col-span-2 lg:justify-self-end">
                <LinkButton
                  href={`/careers/${j.slug}`}
                  variant="outline"
                  size="sm"
                >
                  View role<span className="sr-only">: {j.title}</span>
                </LinkButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-m"
          title="No open roles match."
          text="Send us your email for the next opening."
        >
          <form
            noValidate
            onSubmit={async (e) => {
              e.preventDefault()
              if (state === "busy") return
              if (!isEmail(email)) return setState("error")
              setState("busy")
              const r = await submitSignup({
                email,
                source: "job_alert",
                details: { club, dept, type },
                company: honeypotOf(e.currentTarget),
              }).catch(() => null)
              setState(r?.ok ? "ok" : "failed")
            }}
            className="relative flex w-full max-w-md gap-xs"
          >
            <Honeypot />
            <label className="sr-only" htmlFor="tl">
              Email
            </label>
            <Input
              id="tl"
              type="email"
              autoComplete="email"
              aria-invalid={state === "error"}
              aria-describedby="tl-status"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card"
            />
            <Button type="submit" variant="outline" loading={state === "busy"}>
              Join the list
            </Button>
          </form>
          <p id="tl-status" role="status" className="text-body-s">
            {state === "ok"
              ? "Thanks. We will write when a role opens."
              : state === "error"
                ? "Enter an email like name@example.com."
                : state === "failed"
                  ? "We could not add you. Try again in a minute."
                  : null}
          </p>
        </EmptyState>
      )}
    </div>
  )
}
