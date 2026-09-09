import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('mockRole')?.value || 'visitor';
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/dashboard/admin')) {
    if (role !== 'super_admin' && role !== 'general_supervisor') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
  if (pathname.startsWith('/dashboard/instructor')) {
    if (role !== 'instructor') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
  if (pathname.startsWith('/dashboard/publisher')) {
    if (role !== 'publisher') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
  if (pathname.startsWith('/dashboard/student')) {
    if (role !== 'student') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
  if (pathname.startsWith('/account')) {
    if (role === 'visitor') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
};
