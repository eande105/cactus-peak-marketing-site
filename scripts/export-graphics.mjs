#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
/**
 * Export the gym objects to standalone SVG files for the iOS app and other native uses.
 *
 *   node scripts/export-graphics.mjs            (from marketing-site/)
 *
 * Source of truth: components/brand/graphics/*.ts. Node loads those files with its built-in type
 * stripping (Node 22.18+ / 23.6+); the resolve hook below adds the ".ts" extension that the
 * bundler-style imports leave out.
 *
 * Output: ../brand-graphics/svg/objects/<id>-<mode>.svg and ../brand-graphics/svg/category/<category>[-cut]-<mode>.svg,
 * with colours resolved to hex for the light and dark themes, because native renderers and <img> tags cannot read
 * CSS variables. The script replaces only these two folders. The other folders in svg/ hold frozen exports of the
 * retired sets, which the iOS app still reads (brand-graphics/README.md).
 * The token values come from components/graphical/theme.ts (neutrals, Saguaro Night) and
 * app/globals.css (category colours), so a palette change flows through on the next export.
 */
import { registerHooks } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context)
    } catch (err) {
      if (specifier.startsWith(".")) return next(`${specifier}.ts`, context)
      throw err
    }
  },
})

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const load = (p) => import(pathToFileURL(join(root, p)).href)

/** Token tables (CSS variable name → hex) for light and dark. */
export async function loadTokens() {
  const { theme } = await load("components/graphical/theme.ts")
  const css = readFileSync(join(root, "app/globals.css"), "utf8")
  const block = (selector) => {
    const m = css.match(
      new RegExp(`${selector}\\s*\\{([^}]*--cat-strength[^}]*)\\}`)
    )
    const out = {}
    if (m)
      for (const [, k, v] of m[1].matchAll(
        /(--cat-[a-z-]+):\s*(#[0-9a-fA-F]{6})/g
      ))
        out[k] = v
    return out
  }
  const build = (mode, cat) => {
    const c = theme.theme.colors[mode]
    const t = { ...cat }
    for (const [k, v] of Object.entries(c))
      if (k.startsWith("neutral-")) t[`--${k}`] = v
    t["--night"] = c["color-2"]
    t["--night-foreground"] = c["neutral-3"]
    return t
  }
  return {
    light: build("light", block(":root")),
    dark: build("dark", block("\\.dark")),
  }
}

export async function loadGraphics() {
  const [ser, objects, compose, scheme] = await Promise.all([
    load("components/brand/graphics/serialize.ts"),
    load("components/brand/graphics/objects.ts"),
    load("components/brand/graphics/compose.ts"),
    load("components/brand/graphics/scheme.ts"),
  ])
  return { ser, objects, compose, scheme }
}

async function main() {
  const out = resolve(root, "../brand-graphics/svg")
  for (const set of ["objects", "category", "rack"])
    rmSync(join(out, set), { recursive: true, force: true })
  const tokens = await loadTokens()
  const g = await loadGraphics()
  let count = 0
  const write = (rel, svg) => {
    const file = join(out, rel)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `${svg}\n`)
    count++
  }

  // Gym objects (the brand language). objects/: brand colours on a transparent ground, for any field.
  // category/: each class category's object in its colour, bare and in the 60° cut tile.
  const objectSvg = (drawing, scheme, mode, title, width) =>
    g.ser.drawingToSvg(
      drawing,
      (p) => g.scheme.objPaintHex(p, scheme, tokens[mode], mode === "dark"),
      { title, width }
    )
  for (const id of g.objects.objectIds)
    for (const mode of ["light", "dark"])
      write(
        `objects/${id}-${mode}.svg`,
        objectSvg(
          g.compose.tile(id),
          "sand",
          mode,
          g.objects.objects[id].label,
          256
        )
      )
  for (const [cat, id] of Object.entries(g.objects.categoryObject))
    for (const mode of ["light", "dark"])
      for (const cut of [false, true])
        write(
          `category/${cat}${cut ? "-cut" : ""}-${mode}.svg`,
          objectSvg(
            g.compose.tile(id, cut),
            { category: cat },
            mode,
            g.objects.objects[id].label,
            256
          )
        )

  // rack/: the Night orbit of each class type, for the class heroes and cards in the iOS app (the class pages
  // on the site draw the same Rack). The apps show no Rack for a club or a space.
  // Racks are decorative, so they carry no title.
  const rackSvg = (name, ratio, opts) => {
    const [w, h] = ratio.split("x").map(Number)
    for (const mode of ["light", "dark"])
      write(
        `rack/${name}-${ratio}-${mode}.svg`,
        objectSvg(g.compose.rack(w / h, opts), "night", mode, undefined, 1200)
      )
  }
  for (const [cat, focus] of Object.entries(g.objects.categoryObject))
    rackSvg(`class-${cat}`, "16x9", {
      layout: "orbit",
      focus,
      ids: g.objects.categoryRelated[cat],
    })

  console.log(`Wrote ${count} SVG files to ${out}`)
}

if (import.meta.main) await main()
