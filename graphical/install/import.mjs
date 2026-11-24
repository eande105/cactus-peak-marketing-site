// Writes graphical/install/import.json, the input to `graphical-install`. Run it from the app root:
//   node graphical/install/import.mjs
//
// document: the Cactus Peak Athletic project as saved in Graphical (captured-theme.json, from the project's
//           component download), with the app's font loader and two values the site renders today.
// roleMap:  every token app/globals.css defines, mapped to the Graphical token it already aliased.
// source:   the @theme roles' rendered values, which the fit reads. The color tokens were already plain aliases of
//           the Graphical token they map to, so the document's own values are their authored values.
import { readFile, writeFile } from "node:fs/promises"
import { cssVariablesProfile } from "@graphical/editor/install"

const captured = JSON.parse(
  await readFile(new URL("./captured-theme.json", import.meta.url), "utf8")
)

// next/font registers generated family names, so each role names the loader's variable (lib/fonts.ts).
const fonts = {
  body: {
    ...captured.theme.fonts.body,
    family: "var(--font-inter), system-ui, sans-serif",
  },
  display: {
    ...captured.theme.fonts.display,
    family: "var(--font-archivo), system-ui, sans-serif",
    // The site sets h3 and quiet display text at 700. The saved project says 600.
    weights: { ...captured.theme.fonts.display.weights, medium: 700 },
  },
  data: {
    ...captured.theme.fonts.data,
    family: "var(--font-archivo), system-ui, sans-serif",
  },
}

const document = {
  ...captured,
  theme: { ...captured.theme, fonts },
  componentTokens: {
    ...captured.componentTokens,
    // Design review: the select trigger takes the input edge, not the button edge.
    "select:default:part:control:rest": { borderColor: "neutral-6" },
    "select:default:part:control:hover": { borderColor: "neutral-8" },
  },
}
// install names the theme after the analysis's appName; a style name here would switch on that style's treatments.
delete document.theme.name

const defined = { path: "app/globals.css", selector: ":root" }
const color = (variable, token) => ({ variable, token, format: "css", defined })
const themed = (variable, token, format) => ({
  variable,
  token,
  format,
  defined: { path: "app/globals.css", selector: "@theme inline" },
})

// Each semantic color, the Graphical token it aliases (palette slots as installed: color-1 Arizona Copper,
// color-2 Copper Deep, color-3 Monsoon Sky, color-4 Chili, color-5 Saguaro Night). app/globals.css defines the shadcn variable at :root and
// Tailwind's --color-* name in @theme, so `bg-card` and `text-muted-foreground` stay as aliases of Graphical colors.
const semantic = {
  // shadcn roles
  background: "neutral-3",
  foreground: "neutral-10",
  card: "neutral-1",
  "card-foreground": "neutral-10",
  popover: "neutral-1",
  "popover-foreground": "neutral-10",
  primary: "color-1",
  "primary-foreground": "on:color-1",
  secondary: "neutral-3",
  "secondary-foreground": "neutral-10",
  muted: "neutral-4",
  "muted-foreground": "neutral-8",
  accent: "color-1-transparent",
  "accent-foreground": "neutral-10",
  destructive: "error",
  border: { light: "neutral-5", dark: "neutral-4" },
  input: "neutral-6",
  ring: "color-3",
  // App roles without a shadcn slot
  "input-hover": "neutral-8",
  hover: "neutral-3-transparent",
  "secondary-hover": "neutral-5",
  "primary-hover": "color-2",
  "destructive-hover": "color-4",
  "border-strong": "neutral-6",
  "border-strong-hover": "neutral-8",
  "disabled-foreground": "neutral-6",
  "success-subtle": "success-transparent",
  "warning-subtle": "warning-transparent",
  "danger-subtle": "error-transparent",
  night: "color-5",
  "night-foreground": "neutral-3",
  "night-muted": "neutral-5",
  "night-rule": "neutral-3-transparent",
  "night-fill-strong": "neutral-3-transparent",
  link: "color-2",
}
// Tailwind names with no shadcn variable behind them.
const themeOnly = {
  surface: "neutral-1",
  focus: "color-3",
  "border-hover": "neutral-6",
}

const roleMap = cssVariablesProfile({
  modes: { kind: "class", dark: "dark" },
  tokens: [
    ...Object.entries(semantic).map(([name, token]) =>
      color(`--${name}`, token)
    ),
    // --color-border stays var(--border), the one alias that changes step with the mode.
    ...Object.entries({ ...semantic, ...themeOnly })
      .filter(([name]) => name !== "border")
      .map(([name, token]) => themed(`--color-${name}`, token, "css")),
    // Tailwind @theme roles. Each names the Graphical step it renders, so the fit keeps the account theme's units:
    // the body text role anchors Body M at 16 px (not the 14 px labels), the corner and weight roles pin their steps.
    themed("--text-body", "text.m.size", "px"),
    themed("--radius-sm", "radius.xs", "px"),
    themed("--radius-md", "radius.s", "px"),
    themed("--radius-lg", "radius.m", "px"),
    themed("--radius-2xl", "radius.xl", "px"),
    themed("--font-weight-normal", "weight.body.regular", "number"),
    themed("--font-weight-medium", "weight.body.medium", "number"),
    themed("--font-weight-semibold", "weight.body.heavy", "number"),
    themed("--font-weight-bold", "weight.data.heavy", "number"),
  ],
  appearance: {},
})
// cssVariablesProfile takes no fixed list, so set it on the result.
// Category colors carry fixed class-category meanings with their own light and dark values (spec 01, 2.2).
// --night-fill is a 10% mix that no translucent level matches.
roleMap.fixed = [
  "--night-fill",
  "--tint-strength",
  ...[
    "strength",
    "cycle",
    "conditioning",
    "mind-body",
    "aqua",
    "court",
    "recovery",
    "youth",
  ].flatMap((key) => [
    `--cat-${key}`,
    `--cat-${key}-text`,
    `--color-cat-${key}`,
  ]),
  "--color-night-fill",
]

// What each @theme role renders today, from the saved project (the roles alias these steps).
const t = captured.theme
const authored = {
  "--text-body": `${t.text.m.size}px`,
  "--radius-sm": `${t.radius.xs}px`,
  "--radius-md": `${t.radius.s}px`,
  "--radius-lg": `${t.radius.m}px`,
  "--radius-2xl": `${t.radius.xl}px`,
  "--font-weight-normal": `${t.fonts.body.weights.regular}`,
  "--font-weight-medium": `${t.fonts.body.weights.medium}`,
  "--font-weight-semibold": `${t.fonts.body.weights.heavy}`,
  "--font-weight-bold": `${t.fonts.data.weights.heavy}`,
}
const source = { light: authored, dark: authored }

await writeFile(
  new URL("./import.json", import.meta.url),
  `${JSON.stringify({ document, roleMap, source }, null, 2)}\n`
)
