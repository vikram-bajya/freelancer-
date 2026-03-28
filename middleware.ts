import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Public routes that don't need authentication
const publicRoutes = ["/login", "/register", "/portal", "/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Detect subdomain (e.g., demo-agency.clientportal.com → demo-agency)
  const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000"
  const isMainDomain =
    hostname === mainDomain || hostname === `www.${mainDomain}`

  let workspaceSlug: string | null = null

  if (!isMainDomain && !hostname.includes("localhost")) {
    // Subdomain detected — extract slug
    workspaceSlug = hostname.split(".")[0]
  } else {
    // Fallback for local dev: ?workspace=slug
    workspaceSlug =
      request.nextUrl.searchParams.get("workspace") || null
  }

  // If a workspace slug is detected but not on /portal, rewrite to portal
  if (workspaceSlug && !pathname.startsWith("/portal") && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone()
    url.pathname = `/portal${pathname}`
    url.searchParams.set("workspace", workspaceSlug)
    return NextResponse.rewrite(url)
  }

  // Check auth for admin routes
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  if (!isPublic) {
    const session = await auth()
    if (!session) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const response = NextResponse.next()

  // Pass workspace slug as header for server components
  if (workspaceSlug) {
    response.headers.set("x-workspace-slug", workspaceSlug)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
