import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/auth/get-session";

    const response = await fetch(url, {
        headers: {
            cookie: request.headers.get("cookie") || "",
        },
    });

    const session = await response.json().catch(() => null);

    const { pathname } = request.nextUrl;

    // Protect Admin Routes
    if (pathname.startsWith("/admin")) {
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Protect Member Dashboard
    if (pathname.startsWith("/dashboard")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
    ],
};
