import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that are public and don't require authentication
const publicPaths = ['/'];

// Define path patterns for public APIs and static files
const publicApiPrefixes = ['/api/auth'];
const publicAssetPrefixes = ['/_next', '/favicon.ico', '/api/analyze'];

export function middleware(request: NextRequest) {
  console.log('Middleware invoked for path:', request.nextUrl.pathname);
  console.log('Cookies:', request.cookies.getAll?.().map(c => `${c.name}=${c.value}`).join(', '));
  const path = request.nextUrl.pathname;

  // Check if it's a public path or asset
  const isPublicPath = publicPaths.includes(path);
  const isPublicAsset = publicAssetPrefixes.some(prefix => path.startsWith(prefix));
  const isPublicApi = publicApiPrefixes.some(prefix => path.startsWith(prefix));

  // If it's a public path or asset, allow access
  if (isPublicPath || isPublicAsset || isPublicApi) {
    return NextResponse.next();
  }

  // Check for the auth token cookie
  const authToken = request.cookies.get('auth-token')?.value;

  // If there's no auth token and the user is trying to access a protected route
  if (!authToken) {
    // Redirect to the home page where they can sign in
    const redirectUrl = new URL('/?alert=login_required', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If they have a token, allow access
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/auth (auth endpoints)
     * - /api/analyze (public analysis endpoint)
     */
    '/((?!_next/static|_next/image|favicon\.ico|/api/auth|/api/analyze).*)',
  ],
};
