import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Middleware logic now only runs for paths defined in the matcher
  // So we don't need the explicit asset checks inside the function

  // If user tries to visit /login but already has a session, redirect home
  // Using === '/login' is fine now as matcher handles sub-paths if needed
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user tries to visit a protected route (any route matched by the matcher
  // *except* /login) but has no session, redirect to /login
  if (pathname !== '/login' && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Config object to specify paths middleware should apply to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any path containing a dot (.) likely indicating a file extension
     */
     '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
     // Note: If you *do* have page routes with dots in their names,
     // you might need a more specific pattern or stick to Solution 1.
     // A slightly less strict version without the dot check:
     // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};