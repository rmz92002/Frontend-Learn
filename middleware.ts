import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify, JWTPayload } from "jose"

/* ────────────────────────────────────────────────────────────── */
/* tiny helper to validate & decode the cookie JWT                */
async function validateJWT(token: string): Promise<JWTPayload | null> {
  try {
    // HS256 shared secret
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    console.log("JWT payload:", payload)
    return payload            // { sub: "...", exp: 1715700000, ... }
  } catch {
    console.error("JWT validation failed",token)
    return null               // invalid signature, expired, malformed, …
  }
}
/* ────────────────────────────────────────────────────────────── */

/* tiny helper to ensure every visitor has a stable client_id cookie */
function ensureClientId(resp: NextResponse, req: NextRequest): NextResponse {
  // Only for anonymous users (no access_token)
  if (!req.cookies.get("access_token")) {
    let cid = req.cookies.get("client_id")?.value
    if (!cid) {
      cid = crypto.randomUUID()
      resp.cookies.set({
        name: "client_id",
        value: cid,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }
  }
  return resp
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value
  const { pathname } = req.nextUrl

  // Handle logout: if the user visits /logout, delete the
  // access_token cookie and redirect to the login page.
  if (pathname.startsWith("/logout")) {
    const response = NextResponse.redirect(new URL("/login", req.url))
    response.cookies.delete("access_token")
    return ensureClientId(response, req)
  }

  // pages that *don’t* need auth
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup")

  // validate JWT (returns null if missing or bad)
  const jwtPayload = token ? await validateJWT(token) : null


  /* ---------- already logged in, hitting /login? -> home ---------- */
  if (isAuthPage && jwtPayload) {
    return ensureClientId(NextResponse.redirect(new URL("/", req.url)), req);
  }


  /* ---------- all good, let the request pass through -------------- */
  return ensureClientId(NextResponse.next(), req)
}

/* matcher excludes static files and API routes */
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
}
