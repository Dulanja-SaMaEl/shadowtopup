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

  const sessionEmail = request.cookies.get('active_session_email')?.value;
  const sessionRole = request.cookies.get('active_session_role')?.value;

  // Protect /dashboard
  if (path.startsWith('/dashboard')) {
    if (!user && !sessionEmail) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    if (!user && !sessionEmail) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const isUserAdmin =
      sessionRole === 'admin' ||
      user?.email === 'admin@shadowtopup.com' ||
      (user?.email && user.email.includes('admin'));

    if (!isUserAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
