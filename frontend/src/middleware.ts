import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  const path = request.nextUrl.pathname;

  // Intercept banned users from active sessions
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_banned, banned_at')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.is_banned || profile?.banned_at) {
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Your account has been banned.' },
          { status: 403 }
        );
      }
      if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
        const bannedRedirect = NextResponse.redirect(new URL('/login?error=banned', request.url));
        bannedRedirect.cookies.set('active_session_email', '', { maxAge: 0, path: '/' });
        return bannedRedirect;
      }
    }
  }

  // Protect /api/admin API routes
  if (path.startsWith('/api/admin')) {
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isUserAdmin =
      profile?.role === 'admin' ||
      user.email === 'admin@shadowstorelk.com' ||
      user.email === 'admin@shadowtopup.com' ||
      user.email === 'adminshadowstorelk.com@gmail.com';

    if (!isUserAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }
  }

  // Protect /dashboard
  if (path.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isUserAdmin =
      profile?.role === 'admin' ||
      user.email === 'admin@shadowstorelk.com' ||
      user.email === 'admin@shadowtopup.com' ||
      user.email === 'adminshadowstorelk.com@gmail.com';

    if (!isUserAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*'],
};
