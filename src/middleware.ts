import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { UserRole } from '@/types';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: UserRole = 'visitor';
  let isAuthenticated = !!user;

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role) {
      role = profile.role as UserRole;
    } else {
      role = 'customer';
    }
  }

  // Development mock fallback
  if (!user && process.env.NODE_ENV === 'development') {
    const mockRole = request.cookies.get('mockRole')?.value;
    if (mockRole) {
      role = mockRole as UserRole;
      isAuthenticated = true; // treat as authenticated for mock routing
    }
  }

  const pathname = request.nextUrl.pathname;

  // Route Protection Rules
  const requireAuth = (allowedRoles?: UserRole[]) => {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return null;
  };

  if (pathname.startsWith('/dashboard/admin')) {
    const redirectResponse = requireAuth(['super_admin', 'general_supervisor']);
    if (redirectResponse) return redirectResponse;
  } else if (pathname.startsWith('/dashboard/instructor')) {
    const redirectResponse = requireAuth(['instructor']);
    if (redirectResponse) return redirectResponse;
  } else if (pathname.startsWith('/dashboard/publisher')) {
    const redirectResponse = requireAuth(['publisher']);
    if (redirectResponse) return redirectResponse;
  } else if (pathname.startsWith('/dashboard/student')) {
    const redirectResponse = requireAuth(['student']);
    if (redirectResponse) return redirectResponse;
  } else if (pathname.startsWith('/account')) {
    const redirectResponse = requireAuth();
    if (redirectResponse) return redirectResponse;
    if (role === 'visitor') {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
};
