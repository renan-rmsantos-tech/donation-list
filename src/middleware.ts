import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Admin routes are protected at the layout level via getSession()
  // This is a placeholder for future middleware needs

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
