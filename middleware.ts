import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refresh the Supabase session on every request so server components
 * always get a fresh auth state. Without this, sessions go stale.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Parameters<typeof supabaseResponse.cookies.set>[2] }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — must await to ensure cookies are updated before response
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - Static assets (_next/static, _next/image, favicon, images)
     * - The upload API — large multipart bodies should not be buffered
     *   through the edge middleware; the route handler handles auth itself.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/upload|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
