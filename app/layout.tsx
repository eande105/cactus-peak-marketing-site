import type { Metadata, Viewport } from "next"
import "./globals.css"
import { theme } from "@/components/graphical/theme"
import { GraphicalThemeProvider } from "@/components/graphical-theme-provider"
import { BookingProvider } from "@/components/site/booking"
import { CatalogProvider } from "@/components/site/catalog-context"
import { ClubProvider } from "@/components/site/club-context"
import { ThemeProvider } from "@/components/theme-provider"
import EditorRoot from "@/graphical/editor-root"
import { getClientCatalog } from "@/lib/catalog/server"
import { archivo, inter } from "@/lib/fonts"
import { azNowKey } from "@/lib/time"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cactuspeakathletic.com"),
  title: {
    default: "Cactus Peak Athletic — Five clubs in Mesa and Gilbert",
    template: "%s",
  },
  description:
    "Pools, courts, classes and recovery at five East Valley clubs. Climb at your own pace. Book a free tour or a 3-day pass.",
  icons: { icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }] },
  manifest: "/site.webmanifest",
}
// Saguaro Night, from the brand head snippet. A literal, because the browser reads it before any CSS loads.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets env(safe-area-inset-bottom) reach the fixed bottom bars on phones with a home indicator.
  viewportFit: "cover",
  themeColor: "#1c3328",
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Every page reads the catalog (header menus, footer, search). It is cached for an hour (lib/supabase/public.ts).
  const catalog = await getClientCatalog()
  // globals.css makes in-page jumps smooth. The data attribute tells Next.js to turn that off during a route
  // change; without it, the scroll to the top of a new page animates and stops partway down the page.
  return (
    <html
      lang="en-US"
      suppressHydrationWarning
      className={`${inter.variable} ${archivo.variable} antialiased`}
      data-scroll-behavior="smooth"
    >
      <body>
        <ThemeProvider defaultTheme="light" enableSystem={false}>
          <GraphicalThemeProvider document={theme}>
            <CatalogProvider data={catalog} serverNowKey={azNowKey()}>
              <ClubProvider>
                <BookingProvider>
                  {/* The Graphical editor, in development only (graphical/editor-root.tsx). */}
                  <EditorRoot>{children}</EditorRoot>
                </BookingProvider>
              </ClubProvider>
            </CatalogProvider>
          </GraphicalThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
