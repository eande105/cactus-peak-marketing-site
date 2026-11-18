import type { NextConfig } from "next"

// The clubs were renamed from "City – Area" to their cross streets on Nov 2, 2026. The old club URLs
// stay alive for saved links and search results.
const oldClubSlugs: Record<string, string> = {
  "mesa-dobson": "dobson-southern",
  "mesa-red-mountain": "power-mckellips",
  "mesa-downtown": "main-center",
  "gilbert-val-vista": "val-vista-warner",
  "gilbert-heritage": "gilbert-page",
}

// The schedule, the type pages and the class pages became sections of one page, /classes, on Nov 5, 2026.
// The old URLs scroll to the matching section. Next.js passes the query through, so a filtered
// /schedule?club=x link keeps its filters on the new page.
const classRedirects = [
  { source: "/schedule", destination: "/classes#schedule" },
  { source: "/book", destination: "/classes#schedule" },
  { source: "/reserve", destination: "/classes#schedule" },
  // The type rules come before the class rule, so "category" is never read as a class slug.
  { source: "/classes/category", destination: "/classes#types" },
  {
    source: "/classes/category/:category",
    destination: "/classes#type-:category",
  },
  { source: "/classes/:slug", destination: "/classes#class-:slug" },
]

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  async redirects() {
    return [
      ...Object.entries(oldClubSlugs).map(([from, to]) => ({
        source: `/clubs/${from}`,
        destination: `/clubs/${to}`,
        permanent: true,
      })),
      ...classRedirects.map((r) => ({ ...r, permanent: true })),
    ]
  },
}

export default nextConfig
