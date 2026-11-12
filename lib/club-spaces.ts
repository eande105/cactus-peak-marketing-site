import type { SpaceId } from "@/components/brand/graphics"
import { kidsCostLine } from "./labels"
import { scheduleUrl } from "./links"
import type { Club, ClubSlug } from "./types"

/**
 * The spaces of a club, derived from the club's own data.
 * The web page and the future iOS app read this one mapping.
 * `graphic` is a space id: a key of `spaceObjects`. The app can map it to its own asset.
 */
export type ClubSpace = {
  id: string
  graphic: SpaceId
  name: string
  /** One line. */
  line: string
  /** The amenities in this space. */
  amenities: string[]
  /** An optional page that explains the space. */
  link?: { href: string; label: string }
}

/** An amenity that applies to the whole club. */
export type ClubAmenity = {
  id: string
  graphic: SpaceId
  name: string
  link?: { href: string; label: string }
}

export type ClubSpaces = { primary: ClubSpace[]; amenities: ClubAmenity[] }

type SpaceKind =
  | "pool"
  | "courts"
  | "recovery"
  | "strength"
  | "studios"
  | "kids"
  | "deck"

/** The order of the large spaces for each club. The first four become primary spaces. The rest become amenities. */
const ORDER: Record<ClubSlug, SpaceKind[] | undefined> = {
  "dobson-southern": [
    "pool",
    "courts",
    "recovery",
    "strength",
    "studios",
    "kids",
  ],
  "power-mckellips": ["pool", "courts", "strength", "studios", "kids"],
  "main-center": ["strength", "studios", "recovery"],
  "val-vista-warner": [
    "pool",
    "kids",
    "courts",
    "strength",
    "studios",
    "recovery",
  ],
  "gilbert-page": ["strength", "studios", "recovery", "deck"],
}

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`

function build(id: SpaceKind, c: Club, childPrice: number): ClubSpace | null {
  const s = c.slug
  switch (id) {
    case "pool":
      if (!c.has.pool) return null
      return {
        id,
        graphic: "lap-pool",
        name:
          s === "val-vista-warner"
            ? "Pool and splash pad"
            : s === "dobson-southern"
              ? "Pools"
              : "Pool",
        line:
          s === "power-mckellips"
            ? "A 25-m outdoor pool under shade sails."
            : s === "dobson-southern"
              ? "A 25-yd lap pool and a warm-water pool."
              : "A 25-yd lap pool, a splash pad and swim school.",
        amenities: [
          `${c.lanes} lap lanes`,
          ...(s === "dobson-southern" ? ["Warm-water pool, 90 to 92°F"] : []),
          ...(s === "val-vista-warner"
            ? [
                "Splash pad",
                "Swim school, ages 3–12, levels 1–5",
                "$72 a 6-week session for a member’s child, $108 for a non-member",
                "Non-members can enrol: front desk, (480) 555-0142, or on a tour",
              ]
            : []),
          ...(s === "power-mckellips" ? ["Shade sails", "Aqua Fit"] : []),
          "Lane reservations",
          "Warm showers",
        ],
        link: { href: "/aquatics", label: "About aquatics" },
      }
    case "courts": {
      if (!c.has.courts) return null
      const k = c.courts ?? {}
      const counts = [
        k.pickleball && plural(k.pickleball, "pickleball court"),
        k.tennis && plural(k.tennis, "tennis court"),
        k.basketball && plural(k.basketball, "basketball court"),
      ].filter(Boolean) as string[]
      return {
        id,
        graphic: "courts",
        name: "Courts",
        line: "Book a 60- or 90-minute slot up to 3 days ahead.",
        amenities: [
          ...counts,
          // Open play runs only where the timetable has it; Dobson & Southern has clinics and tennis drills.
          c.slug === "dobson-southern"
            ? "Clinics and tennis drills"
            : "Open play and clinics",
          "Loaner paddles at the desk",
        ],
        link: { href: "/courts", label: "About courts" },
      }
    }
    case "recovery":
      if (!c.has.recovery) return null
      return {
        id,
        graphic: "recovery",
        name:
          s === "dobson-southern" || s === "val-vista-warner"
            ? "Recovery suite"
            : "Recovery lounge",
        line: "A Summit benefit.",
        amenities: [
          "Sauna",
          "Compression",
          s === "dobson-southern" || s === "val-vista-warner"
            ? "Cold plunge"
            : "Stretch area",
        ],
        link: { href: "/recovery", label: "About recovery" },
      }
    case "strength":
      return {
        id,
        graphic: "strength-floor",
        name: "Strength floor",
        line:
          c.type === "Studio club"
            ? "Racks and a cardio floor, built for a short visit."
            : "Racks and a cardio floor with room to spread out.",
        amenities: [
          "Racks",
          "Cardio",
          ...(s === "gilbert-page" ? ["Olympic lifting platforms"] : []),
          ...(s === "power-mckellips" ? ["Turf lane"] : []),
        ],
      }
    case "studios":
      return {
        id,
        graphic: "studio",
        name: "Studios",
        line: `${plural(c.studios, "studio")} and a cycle studio.`,
        amenities: [`${plural(c.studios, "group studio")}`, "Cycle studio"],
        link: { href: scheduleUrl({ club: s }), label: "See classes" },
      }
    case "kids":
      if (!c.has.kids) return null
      return {
        id,
        graphic: "kids-club",
        name: "Kids club",
        line: "Ages 6 months to 12 years, while you train.",
        amenities: [
          "Mon–Sat 8 am–12 pm and 4–8 pm",
          "2-hour blocks",
          "Parent check-in",
          "Allergy notes",
          kidsCostLine(childPrice),
        ],
        link: { href: "/kids", label: "About kids club" },
      }
    case "deck":
      if (s !== "gilbert-page") return null
      return {
        id,
        graphic: "deck",
        name: "Rooftop mobility deck",
        line: "Stretch outdoors at golden hour.",
        amenities: ["Open-air mobility space", "Lift and stairs"],
      }
  }
}

/** The 3 or 4 spaces to feature, and the amenities for the whole club. */
export function clubSpaces(club: Club, childPrice: number): ClubSpaces {
  // A club that is not in ORDER gets the spaces its facility flags allow, in a default order.
  const all = (
    ORDER[club.slug] ?? [
      "pool",
      "courts",
      "strength",
      "studios",
      "recovery",
      "kids",
    ]
  )
    .map((id) => build(id, club, childPrice))
    .filter((x): x is ClubSpace => x !== null)
  const primary = all.slice(0, 4)
  const rest = all.slice(4)
  const amenities: ClubAmenity[] = rest.map((r) => ({
    id: r.id,
    graphic: r.graphic,
    name: r.id === "studios" ? "Studios and cycle" : r.name,
    link: r.link && r.id !== "studios" ? r.link : undefined,
  }))
  if (club.slug === "power-mckellips") {
    amenities.unshift({ id: "deck", graphic: "deck", name: "Cardio deck" })
  }
  if (club.has.pool)
    amenities.push({
      id: "changing",
      graphic: "lockers",
      name: "Changing rooms",
    })
  if (club.slug === "dobson-southern")
    amenities.push({ id: "cafe", graphic: "lounge", name: "Café" })
  return { primary, amenities }
}
