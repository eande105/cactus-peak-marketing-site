import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { CATALOG_TAG } from "@/lib/supabase/public"

// Dev only: refresh the cached catalog after the database changes, without restarting the server.
// Open /api/dev/revalidate once. In production this route answers 404.
export function GET() {
  if (process.env.NODE_ENV !== "development")
    return new NextResponse("Not found", { status: 404 })
  revalidateTag(CATALOG_TAG, { expire: 0 })
  return NextResponse.json({ revalidated: CATALOG_TAG })
}
