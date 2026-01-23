import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/login', '/register']
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('auth-token')?.value

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isApiRoute = pathname.startsWith('/api')

  // Skip middleware for API routes
  if (isApiRoute) {
    return NextResponse.next()
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (authToken && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not authenticated and trying to access protected routes
  if (!authToken && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
