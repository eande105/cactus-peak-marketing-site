import type { AmenityKey, Club } from "@/lib/types"
import type { ObjectId } from "./graphics"

/*
 * The object for each club facility. A plain module, not a client one, so server components can call it
 * too (club-parts is a client module and re-exports it).
 */

// Each facility line takes the object that pictures it, so the list reads at a glance. Order matters:
// the more specific phrase is tested first ("Splash pad" before "pool", "Cycle studio" before "studio").
const facilityIcons: [RegExp, ObjectId][] = [
  [/splash/i, "wave"],
  [/swim school/i, "whistle"],
  [/pool/i, "pool"],
  [/pickleball|tennis/i, "paddle"],
  [/basketball/i, "basketball"],
  [/turf/i, "cone"],
  [/kids/i, "playground"],
  [/^cycle studio/i, "spin-bike"],
  [/studio/i, "mat"],
  [/recovery/i, "spa-stones"],
  [/caf/i, "shaker"],
  [/olympic|platform/i, "barbell"],
  [/strength/i, "dumbbell"],
  [/rooftop|mobility/i, "sun"],
  [/cardio/i, "treadmill"],
]
export const facilityIcon = (label: string): ObjectId =>
  facilityIcons.find(([re]) => re.test(label))?.[1] ?? "gym-bag"

/**
 * The object and name for each facility in `Club.has`. Every page that says where a facility is takes its
 * picture and name from here, so a pool is the same pool object on the plan cards, the club key and the
 * activity list.
 */
export const facility = {
  classes: { object: "schedule", label: "Classes" },
  cycling: { object: "spin-bike", label: "Cycle studio" },
  pool: { object: "pool", label: "Pool" },
  courts: { object: "paddle", label: "Courts" },
  recovery: { object: "spa-stones", label: "Recovery" },
  kids: { object: "playground", label: "Kids club" },
} as const satisfies Record<AmenityKey, { object: ObjectId; label: string }>

const facilityOrder: AmenityKey[] = [
  "classes",
  "cycling",
  "pool",
  "courts",
  "recovery",
  "kids",
]

/** The clubs that have a facility, in the club order. */
export const clubsWith = (clubs: Club[], key: AmenityKey) =>
  clubs.filter((c) => c.has[key])

/**
 * The facilities that only some clubs have, in the site's order. A facility at every club (classes, the cycle
 * studio) does not help a visitor tell the clubs apart, so a club key leaves it out.
 */
export const varyingFacilities = (clubs: Club[]) =>
  facilityOrder.filter((k) => clubs.some((c) => !c.has[k]))
