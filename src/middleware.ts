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

  // كان هنا باب تطوير: كوكي اسمه mockRole بيدّي أي زائر أي دور ويعتبره
  // مسجّل دخوله. اتشال هو والشريط اللي كان بيكتبه ودالة المستخدم الوهمي.

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
  } else if (pathname.startsWith('/dashboard/provider')) {
    // مش بنحدد دور هنا: المدرب اللي بيقدّم خدمة دوره لسه «مدرب»، والصفحة
    // نفسها بتتأكد إن للمستخدم صف مقدّم خدمة وبتحوّله لو مالوش.
    const redirectResponse = requireAuth();
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

    // ⚠️ حساب الطالب التابع **مالوش مكان هنا.**
    //
    // `/account` هي منطقة العميل/ولي الأمر: المركز العائلي، وطلبات
    // الأبناء، والاشتراكات، والدفع. والحماية كانت `requireAuth()` بس —
    // يعني أي مسجَّل بما فيهم الطالب.
    //
    // والهيدر بيوجّه الطالب لـ`/dashboard/student` صح، بس ده مش حاجز:
    // أي رابط `/account/...` (من إشعار مثلًا) كان بيدخّله.
    //
    // وأوضح نتيجة كانت شاشة «طلبات الأبناء»: الاستعلام مبيفلترش بالدور
    // (القاعدة بتفلتر)، و`can_see_dependent_request` بتسمح للطفل يشوف
    // طلبه هو — فالطالب كان بيشوف **طلباته هو** تحت عنوان «طلبات
    // الأبناء» ونص بيخاطبه كأنه الأب: «لما ابنك يطلب…».
    if (role === 'student') {
      return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
};
