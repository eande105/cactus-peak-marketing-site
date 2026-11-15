# Graphical

This app runs on Graphical. This folder is its Graphical project.

- `project.json`, `themes/` and `role-map.json` are the project: its themes and which one is active, and how the app's tokens map to Graphical's. Change them through the editor or Graphical's skills.
- `generated/` holds files graphical-install writes from the active theme: `theme.css`, the Tailwind classes and the app's token aliases. Don't edit them. To change one, edit the theme, then run `npx graphical-install --theme <id>`.
- `install/` records the import: the analysis and import scripts, their inputs and the install report. Nothing at runtime reads it.

## App-owned additions

- `themes/graphical.json` is this app's installed copy of the "Cactus Peak Athletic" theme saved on graphicalui.com, the source of truth for both Cactus Peak apps.
- `install/pull-theme.mjs`: installs the account theme from a graphicalui.com registry link, mapping the font roles to the next/font variables.
- `install/analyze-styles.mjs`, `install/import.mjs`: this app's analysis and import scripts. `captured-theme.json` is only a record of the account theme before the import; the account now holds the imported theme.
- `install/write-merge-config.mjs`: writes `generated/tailwind-merge.cjs` for `cn` in `lib/utils.ts` (shadcn's `cn` package takes the same config). Run it after `graphical-install --theme`.
- `install/write-theme-reference.mjs`: writes `gui/themes/cactus-peak-athletic.md` from the installed theme. Run it after `graphical-install --theme`.
- `editor-root.tsx`, `development-editor.tsx`, `installed-editor.tsx`, `editor.css`: the development-only editor mount. `editor.css` puts the editor's stylesheet in its own cascade layer, so it can't override the app's utilities.
