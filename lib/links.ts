// The member web app (separate Next.js app in ../web-app). Set NEXT_PUBLIC_MEMBER_APP_URL per environment.
export const MEMBER_APP_URL = (
  process.env.NEXT_PUBLIC_MEMBER_APP_URL ?? "http://localhost:3200"
).replace(/\/$/, "")
export const MEMBER_SIGN_IN_URL = `${MEMBER_APP_URL}/sign-in`

/*
 * All class content lives on one page, /classes. The query holds the schedule's filters and the hash says where
 * to scroll, so a link from another page opens the right section with the right filters.
 */

/** A class has no page of its own. A class link scrolls to its entry on the classes page. */
export const classHref = (c: { slug: string }) => `/classes#class-${c.slug}`

/** A class type has no page of its own. A type link scrolls to its section on the classes page. */
export const typeHref = (id: string) => `/classes#type-${id}`

/** The schedule's filters, in the query keys the board reads. `coach` is the coach's slug, not the name. */
export type ScheduleFilters = {
  club?: string
  class?: string
  category?: string
  time?: string
  day?: string
  view?: string
  coach?: string
  firstTimer?: boolean
  spots?: string
  int?: string
  session?: string
}

/** The schedule on the classes page with these filters. Empty filters stay out of the address. */
export function scheduleUrl(filters: ScheduleFilters = {}) {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "" || value === false) continue
    q.set(key, value === true ? "1" : value)
  }
  const s = q.toString()
  return `/classes${s ? `?${s}` : ""}#schedule`
}
