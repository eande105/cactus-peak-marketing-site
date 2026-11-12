import type { Level } from "@/lib/types"

// Fixed words for the five-rib meters (00-foundation.md §2 and §3).
export const LEVEL_WORD = [
  "",
  "Easy",
  "Light",
  "Moderate",
  "Hard",
  "All-out",
] as const
/** What each effort level feels like. The talk test is the one cue a first-timer can check mid-class. */
export const EFFORT: Record<Level, string> = {
  1: "You can talk the whole time.",
  2: "A light sweat. Your breath stays easy.",
  3: "You can say a short sentence.",
  4: "A few words at a time.",
  5: "Short bursts, then real rest.",
}
export const BUSY_WORD = [
  "",
  "Quiet",
  "Light",
  "Steady",
  "Busy",
  "Packed",
] as const

/**
 * The one sentence for what a child costs (00-foundation.md section 4). Every page uses it so the
 * price reads the same everywhere. It is two sentences so a visitor does not read kids club as a charge.
 */
export const kidsCostLine = (child: number) =>
  `Add each child (6 months to 17) for $${child} a month. That price includes kids club for children 12 and under.`

/** Member services and the club desks answer the phone on these hours (00-foundation.md section 4.1). */
export const PHONE_HOURS = "6 am–8 pm every day"
/** The member services phone hours in minutes after midnight, for hours tables. Keep in step with PHONE_HOURS. */
export const PHONE_HOURS_MIN: [number, number] = [6 * 60, 20 * 60]

/** The senior rate and the Medicare benefit (section 4.1), as one line near the plans. */
export const SENIOR_LINE =
  "65 or older? Senior rate: $10 off any plan. Medicare fitness benefits accepted."

/** Swim school facts (section 4.1). It is at Val Vista & Warner only. */
export const SWIM = {
  club: "val-vista-warner",
  clubName: "Val Vista & Warner",
  ages: "3–12",
  memberPrice: 72,
  nonMemberPrice: 108,
  phone: "(480) 555-0142",
  tel: "tel:+14805550142",
  levels: [
    ["Splash", "3–5", "Water comfort and floating."],
    ["Float", "4–7", "Back and front float, short glide."],
    ["Kick", "5–9", "Kick with a board, breathe to the side."],
    ["Stroke", "6–12", "Freestyle and backstroke across the pool."],
    ["Lap-ready", "8–12", "Swim 100 yards without stopping."],
  ],
} as const

/** "1 class", "0 classes". Pass the plural when it is not just an added "s". */
export const countOf = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`

/** The FAQ groups in their fixed order. Any new group in the data follows them. */
export const FAQ_GROUPS = ["Getting started", "Memberships", "Kids and teens"]
