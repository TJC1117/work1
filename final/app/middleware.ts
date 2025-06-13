// app/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // ❗必要，建立 session（否則 API 無法使用）
  await supabase.auth.getSession();

  return res;
}

// ➕ 指定路徑
export const config = {
  matcher: ['/api/auth/:path*'],
};
