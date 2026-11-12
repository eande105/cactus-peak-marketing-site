"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useCatalog } from "@/components/site/catalog-context"
import { CoachGrid } from "./coaches-client"
import { ContactForm } from "./small-client"

// These pages read filters from the query string. Reading `searchParams` on the server would make
// the whole page render on every request. Reading it here keeps the page static, so the CDN serves it.
// The fallback is the same component with no filters, so the static HTML shows real content, not a skeleton.

function CoachesFromUrl() {
  const sp = useSearchParams()
  return (
    <CoachGrid
      init={{
        club: sp.get("club") ?? undefined,
        specialty: sp.get("specialty") ?? undefined,
      }}
    />
  )
}
export function CoachGridFromUrl() {
  return (
    <Suspense fallback={<CoachGrid init={{}} />}>
      <CoachesFromUrl />
    </Suspense>
  )
}

const CONTACT_TOPICS: Record<string, string> = {
  tour: "Tour or pass",
  accessibility: "Something else",
  coach: "Personal training",
  orientation: "Membership",
  careers: "Careers",
}
function ContactFromUrl() {
  const sp = useSearchParams()
  const { jobs } = useCatalog()
  const { clubs } = useCatalog()
  const job = jobs.find((j) => j.slug === sp.get("role"))
  // A job names its club, not the club slug the form's select uses.
  const jobClub = job ? clubs.find((c) => c.name === job.club)?.slug : undefined
  return (
    <>
      {job ? (
        <p className="mb-4 text-body-strong">
          Applying for: {job.title}, {job.club}
        </p>
      ) : null}
      <ContactForm
        defaults={{
          topic: CONTACT_TOPICS[sp.get("topic") ?? ""],
          club: sp.get("club") ?? jobClub,
          coach: sp.get("coach") ?? undefined,
          message: job
            ? `I would like to apply for the ${job.title} role at ${job.club}.\n\n`
            : undefined,
        }}
      />
    </>
  )
}
export function ContactFormFromUrl() {
  return (
    <Suspense fallback={<ContactForm defaults={{}} />}>
      <ContactFromUrl />
    </Suspense>
  )
}
