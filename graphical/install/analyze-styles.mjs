// Analyzes the app's styles for Graphical. Re-run before every `graphical-install` run, `--check` or `--theme`:
//   node graphical/install/analyze-styles.mjs
import { readFile, writeFile } from "node:fs/promises"
import { analyzeAppStyles } from "@graphical/editor/analyze-styles"
import { previewCssVariables } from "@graphical/editor/install"

// app/globals.css aliases Graphical's variables (var(--space-m), var(--radius-xs), ...). The analysis can't see
// where those are defined, so give it the active theme's values: the installed theme once there is one, the
// import's document before that.
const readJson = async (file) =>
  JSON.parse(await readFile(new URL(file, import.meta.url), "utf8"))
const theme = await readJson("../themes/graphical.json").catch(
  async () => (await readJson("./import.json")).document
)

// The semantic color names app/globals.css defines (shadcn's and the app's own). Each is an alias of a Graphical
// color, so its classes (bg-card, text-muted-foreground, ring-border/40) stay as written: they follow the theme and
// keep shadcn's names. The analysis records a class by its resolved color, not by the alias it reads, so without
// this the install would rewrite every semantic class onto a raw palette name.
const css = await readFile(
  new URL("../../app/globals.css", import.meta.url),
  "utf8"
)
const semanticColors = new Set(
  [...css.matchAll(/^\s*--color-([a-z][\w-]*):\s*var\(--[\w-]+\);/gm)].map(
    (match) => match[1]
  )
)
const colorUtility =
  /^(?:bg|text|border(?:-[trblxyse])?|ring|ring-offset|inset-ring|outline|decoration|divide|fill|stroke|from|via|to|caret|accent|placeholder|shadow)-([a-z][\w-]*?)(?:\/[\d.]+)?$/
const isSemanticColorClass = (text) => {
  const utility = text
    .split(/:(?![^[]*\])/)
    .at(-1)
    .replace(/^!/, "")
  const name = utility.match(colorUtility)?.[1]
  return !!name && semanticColors.has(name)
}

const inventory = await analyzeAppStyles({
  root: process.cwd(),
  roots: ["app", "components", "lib", "hooks"],
  appName: "Cactus Peak Athletic",
  tailwind: true,
  variables: previewCssVariables(theme.theme, "light"),
  // The corner classes read Graphical's steps through @theme aliases (--radius-lg: var(--radius-m)). The analysis
  // resolves those names against Tailwind's own --radius-* defaults instead, so state what they render.
  scales: {
    borderRadius: {
      sm: `${theme.theme.radius.xs}px`,
      md: `${theme.theme.radius.s}px`,
      lg: `${theme.theme.radius.m}px`,
      "2xl": `${theme.theme.radius.xl}px`,
      full: `${theme.theme.radius.full}px`,
    },
  },
  // The Graphical component runtime is library source. Its styles come from the theme document through its own
  // resolver, not from class lists.
  exclude: [/^components\/graphical\//],
  // Calls the analysis mistakes for class helpers. Each was reviewed: none builds a class list.
  reviewCoverage({ path, kind, line }) {
    if (kind !== "unresolved-class-source") return undefined
    const reviewed = {
      "lib/utils.ts":
        "The merge call inside cn(); cn's own arguments are traced.",
      "lib/fonts.ts": "next/font loader calls, not class lists.",
      "components/sections/small-client.tsx":
        "classBySlug() looks up a gym class in the catalog, not a CSS class.",
      "lib/catalog/index.ts":
        "classByKey() looks up a gym class in the catalog, not a CSS class.",
    }
    return reviewed[path] ? `${reviewed[path]} (line ${line})` : undefined
  },
  classify({ path, family, text }) {
    if (family === "color" && isSemanticColorClass(text))
      return { preserve: true }
    // Brand artwork and the map draw with their own fixed palettes (VISUAL-IDENTITY.md). The phone mockup's frame
    // is drawn geometry, not a theme corner or stroke.
    if (
      /^components\/brand\/(graphics\/|club-art|journal-art)/.test(path) ||
      path === "components/map/brand-map-style.ts" ||
      (path === "components/sections/app-phone.tsx" &&
        /^(rounded-\[36px\]|border-\[6px\])$/.test(text))
    )
      return { preserve: true }
    // Visible edges are box shadows read from --border-* (the hairline and rule utilities), which the analysis
    // can't count. The few native border widths left would otherwise refit the theme's strokes around themselves.
    if (family === "border-width") return { preserve: true }
    return {}
  },
})
await writeFile(
  new URL("./style-inventory.json", import.meta.url),
  JSON.stringify(inventory)
)
