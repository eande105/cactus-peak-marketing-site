# Graphical install

Rewrote 108 source files and wrote the project files in `graphical`.

## Use sites

| Family | Rewritten | Removed | Skipped | Tokens | Kept | Preserved |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| border-width | 4 | 0 | 0 | 0 | 0 | 10 |
| color | 19 | 0 | 0 | 7 | 21 | 911 |
| font-family | 0 | 0 | 0 | 0 | 0 | 7 |
| font-size | 840 | 0 | 0 | 0 | 0 | 12 |
| font-weight | 385 | 0 | 0 | 122 | 0 | 5 |
| letter-spacing | 7 | 0 | 0 | 0 | 0 | 0 |
| line-height | 3 | 4 | 0 | 0 | 3 | 14 |
| radius | 304 | 0 | 0 | 0 | 0 | 4 |
| shadow | 0 | 0 | 0 | 0 | 7 | 11 |
| spacing | 2,111 | 0 | 0 | 0 | 0 | 16 |
| token | 43 | 0 | 0 | 0 | 0 | 0 |

Removed: line heights and tracking a text style carries instead. Tokens: uses of the app’s own tokens, such as `bg-background`, which follow the token once it aliases a Graphical one, and classes that already have Graphical’s name, such as `font-medium`. Kept: values the conversion keeps as authored. Preserved: values the analysis preserved, such as content colors, artwork, state recipes and dynamic values.

## Units

| Family | Values | Units | Multiples | Kept |
| --- | ---: | ---: | ---: | ---: |
| Colors | 18 | 15 | 0 | 0 |
| Text sizes | 10 | 8 | 0 | 0 |
| Font weights | 5 | 3 | 0 | 0 |
| Letter spacing | 4 | 2 | 0 | 0 |
| Spacing | 11 | 7 | 4 | 0 |
| Corners | 4 | 4 | 0 | 0 |
| Shadows | 3 | 2 | 0 | 1 |

## Style coverage

- `lib/utils.ts:32`: Cannot resolve class helper merge. Include its source or convert and review this class expression manually. Needs source review before conversion is complete.
- `lib/fonts.ts:13`: Cannot resolve class helper Inter. Include its source or convert and review this class expression manually. Needs source review before conversion is complete.
- `lib/fonts.ts:7`: Cannot resolve class helper Archivo. Include its source or convert and review this class expression manually. Needs source review before conversion is complete.
- `components/sections/small-client.tsx:47`: Cannot resolve class helper classBySlug. Include its source or convert and review this class expression manually. Needs source review before conversion is complete.
- `lib/catalog/index.ts:153`: Cannot resolve class helper cat.classByKey. Include its source or convert and review this class expression manually. Needs source review before conversion is complete.

## Skipped sites

None.

## Text style overrides

0 already present in source; 7 retained during this conversion.

These stay beside their text style, so the inspector shows each as an override of it.

- `components/sections/class-page.tsx:178` `leading-none` on Display M: leading that sets a box’s height
- `components/sections/common.tsx:421` `leading-none` on Display M: leading that sets a box’s height
- `components/sections/detail-parts.tsx:171` `leading-none` on Body S: leading that sets a box’s height
- `components/sections/program-heroes.tsx:94` `leading-none` on Body L: leading that sets a box’s height
- `components/sections/program-heroes.tsx:218` `leading-none` on Body L: leading that sets a box’s height
- `components/sections/program-heroes.tsx:290` `leading-none` on Body XXL: leading that sets a box’s height
- `components/sections/teens.tsx:108` `leading-none` on Body XXL: leading that sets a box’s height

## Cleanup

Install grouped 160 long class lists by layout, box, type and appearance, then states.

## Spacing multiples

Spacing past the largest step is written as a multiple of it. Name the large ones in a few places for what they are, such as `--page-gutter` or `--toolbar-clearance`: a custom property in a CSS rule beside the layout, with its responsive values, that the layout reads through `var(--page-gutter)`. A multiple used widely is ordinary spacing the scale doesn’t reach: raise it rather than naming it. Steps such as `gap-m` and `px-l` stay as classes.

| Multiple | Value | Uses | Files | Most used as |
| --- | ---: | ---: | ---: | --- |
| XXL × 4/3 | 64px | 93 | 41 | `lg:gap-[calc(var(--space-xxl)*4/3)]` (26), `lg:pt-[calc(var(--space-xxl)*4/3)]` (17), `lg:pb-[calc(var(--space-xxl)*4/3)]` (12), `py-[calc(var(--space-xxl)*4/3)]` (9) |
| XXL × 2 | 96px | 9 | 9 | `lg:py-[calc(var(--space-xxl)*2)]` (5), `min-[100rem]:px-[calc(var(--space-xxl)*2)]` (2), `lg:pb-[calc(var(--space-xxl)*2)]` (1), `xl:py-[calc(var(--space-xxl)*2)]` (1) |
| XXL × 5/3 | 80px | 6 | 6 | `lg:py-[calc(var(--space-xxl)*5/3)]` (3), `sm:pl-[calc(var(--space-xxl)*5/3)]` (1), `sm:-mt-[calc(var(--space-xxl)*5/3)]` (1), `lg:mt-[calc(var(--space-xxl)*5/3)]` (1) |
| XXL × 7/3 | 112px | 2 | 2 | `pb-[calc(var(--space-xxl)*7/3)]` (1), `pt-[calc(var(--space-xxl)*7/3)]` (1) |

## Kept values

- `ranged
                ? ˋinset 0 0 0 ${s.w <= 4 ? 1 : 1.5}px ${ink}ˋ
                : on
                  ? undefined
                  : "inset 0 0 0 1.5px  #8c7f6b"` (shadow): edge

## Warnings

- Install found no Prettier, so the files it rewrote keep its own formatting. Run the project’s formatter on them.

## Left to the agent

- Load `graphical/generated/theme.css` before the app’s styles. Install rewrote the token definitions written in CSS as aliases. Semantic names such as `bg-background` stay as aliases.
- Import `graphical/generated/tailwind-theme.css` right after `@import "tailwindcss"`.
- Resolve the skipped sites, install the theme’s fonts and mount the editor.
- Check the running app. This report and `graphical-install --check` read source, so they show the conversion is complete, not that the app runs. Load the home page and one other page with the dev server: each renders with the editor mounted, and the browser console and the framework’s error overlay show no errors. A page can answer HTTP 200 while a client error stops the editor from loading.
