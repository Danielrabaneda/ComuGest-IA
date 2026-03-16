import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const start = performance.now()
    // This will refresh the session if it's expired
    const { data: { user } } = await supabase.auth.getUser()
    const end = performance.now()
    
    console.log(`DEBUG: Middleware auth check took ${(end - start).toFixed(2)}ms for ${request.nextUrl.pathname}`)

    const { pathname } = request.nextUrl

    // Auth Guard
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
    const isRootPage = pathname === '/'

    if (!user && !isAuthPage && !isRootPage && !pathname.includes('/api/')) {
        console.log('DEBUG: Middleware redirecting to /login')
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user is logged and try to go to login, redirect to home
    if (user && isAuthPage) {
        console.log('DEBUG: Middleware redirecting to /home')
        const url = request.nextUrl.clone()
        url.pathname = '/home'
        return NextResponse.redirect(url)
    }

    return response
}
