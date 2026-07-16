import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/profile', '/my-tickets', '/organizer', '/admin'];
const authRoutes = ['/login', '/register', '/verify', '/forgot-password'];

export function middleware(request: NextRequest) {
  // We can check if auth-storage cookie exists (set by zustand persist if we switch to cookie storage)
  // Or check a specific auth cookie if we set one during login
  // For now, since we use localStorage (zustand persist), Next.js middleware cannot read it directly.
  // The plan specified "httpOnly Secure cookie dari API atau BFF", but API returns JSON body tokens (Phase 1.3: "Set-Cookie httpOnly untuk refresh").
  // Let's implement basic logic: if we don't have tokens in cookies, we can't fully protect via middleware, 
  // but we can check if a "has_auth" cookie exists, or just protect via Client Components.
  // For now, I'll add a simple client-side redirection wrapper or set a dummy cookie on login to help middleware.
  
  const hasAuthCookie = request.cookies.has('auth-token') || request.cookies.has('has-auth');
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  // If trying to access protected route without auth
  if (isProtectedRoute && !hasAuthCookie) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If trying to access auth route (like /login) while already authenticated
  if (isAuthRoute && hasAuthCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};