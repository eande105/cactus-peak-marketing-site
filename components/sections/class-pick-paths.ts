/**
 * The paths of the Pick (the classes hero composition). Discs follow streamlines of a smooth flow field, traced with
 * a fixed gap between lines (after Jobard and Lefer, "Creating evenly-spaced streamlines", 1997). Streamlines of one
 * field never cross, so the paths never intersect. The field points every path at the focal point, turned by a
 * light swirl and a smooth wander that together stay under 90°, so every path keeps closing in on the focal point
 * and none loops back on itself. Paths stop at a clear circle around the focal point, where the focal icon sits.
 *
 * All units are disc diameters, with the focal point at 0,0. A fixed seed gives the same paths
 * on the server and on every visit.
 */

export type PickDisc = { x: number; y: number; path: number }

type Opts = {
  /** Width and height of the area to fill. */
  width: number
  height: number
  seed: number
  /** The gap between neighbouring paths, centre to centre. */
  sep: number
  /** The gap between discs along a path, centre to centre. */
  spacing: number
  /** The radius of the clear circle around the focal point. */
  focus: number
  /** How far every path turns from the straight line to the focal point, in degrees. */
  swirl: number
}

/** A small seeded random source (mulberry32). */
export function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STEP = 0.1
/** Paths shorter than this, in discs, are dropped. A short path of two discs is kept, so gaps between long paths fill. */
const MIN_LENGTH = 1.2

export function pickPaths({
  width,
  height,
  seed,
  sep,
  spacing,
  focus,
  swirl,
}: Opts): {
  discs: PickDisc[]
  paths: number
} {
  const rand = seeded(seed)
  const p = Array.from({ length: 3 }, () => rand() * Math.PI * 2)
  const turn = (swirl * Math.PI) / 180
  // The heading: straight at the focal point, plus the swirl, plus three waves that sum to under 0.67 rad (38°).
  const angle = (x: number, y: number) =>
    Math.atan2(-y, -x) +
    turn +
    0.35 * Math.sin(0.46 * x + 0.37 * y + p[0]) +
    0.2 * Math.sin(0.29 * x - 0.64 * y + p[1]) +
    0.12 * Math.sin(0.81 * y + p[2])
  const halfW = width / 2 + 1
  const halfH = height / 2 + 1

  // Samples of every finished path, in a grid of cells one gap wide, for fast distance checks.
  const cells = new Map<string, [number, number][]>()
  const key = (x: number, y: number) =>
    `${Math.floor(x / sep)},${Math.floor(y / sep)}`
  const near = (x: number, y: number, d: number) => {
    if (x * x + y * y < focus * focus) return true
    const cx = Math.floor(x / sep)
    const cy = Math.floor(y / sep)
    for (let i = cx - 1; i <= cx + 1; i++)
      for (let j = cy - 1; j <= cy + 1; j++)
        for (const [sx, sy] of cells.get(`${i},${j}`) ?? [])
          if ((sx - x) ** 2 + (sy - y) ** 2 < d * d) return true
    return false
  }

  // A path stops at the edge of the area, at the clear circle, or when it comes closer than half the gap to
  // another path. Forward (dir 1) runs toward the focal point, so the last point of a line is its inner end.
  const trace = (x0: number, y0: number) => {
    const halves = [1, -1].map((dir) => {
      const pts: [number, number][] = []
      let x = x0
      let y = y0
      for (let n = 0; n < 4000; n++) {
        const a = angle(x, y)
        x += dir * STEP * Math.cos(a)
        y += dir * STEP * Math.sin(a)
        if (Math.abs(x) > halfW || Math.abs(y) > halfH) break
        if (near(x, y, sep * 0.5)) break
        pts.push([x, y])
      }
      return pts
    })
    return [...halves[1].reverse(), [x0, y0] as [number, number], ...halves[0]]
  }

  // Seeds from a jittered grid, in random order. A seed must sit 85% of the gap from every path, so
  // short paths can fill the spaces that long paths leave.
  const seeds: [number, number][] = []
  for (let x = -halfW; x < halfW; x += sep / 2)
    for (let y = -halfH; y < halfH; y += sep / 2)
      seeds.push([x + rand() * sep * 0.5, y + rand() * sep * 0.5])
  for (let i = seeds.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[seeds[i], seeds[j]] = [seeds[j], seeds[i]]
  }

  const discs: PickDisc[] = []
  let paths = 0
  for (const [sx, sy] of seeds) {
    if (near(sx, sy, sep * 0.85)) continue
    const line = trace(sx, sy)
    const length = (line.length - 1) * STEP
    if (length < MIN_LENGTH) continue
    for (const pt of line) {
      const k = key(pt[0], pt[1])
      const cell = cells.get(k)
      if (cell) cell.push(pt)
      else cells.set(k, [pt])
    }
    // Discs at even steps along the path, from its inner end outward, so every path ends in a disc that points
    // at the focal icon.
    const every = Math.round(spacing / STEP)
    for (let i = line.length - 1; i >= 0; i -= every) {
      const [x, y] = line[i]
      if (discs.some((d) => (d.x - x) ** 2 + (d.y - y) ** 2 < 1.1 ** 2))
        continue
      discs.push({ x, y, path: paths })
    }
    paths++
  }
  return { discs, paths }
}
