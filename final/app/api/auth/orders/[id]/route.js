import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies as getCookies } from 'next/headers';
// import { Param } from '@/lib/generated/prisma/runtime/library';
export async function PUT(request) {
  // const { params } = await context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const parts = pathname.split('/');
  const id = parts[parts.length - 1];
  const cookieStore = await getCookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { status, paymentStatus } = await request.json(); // 👈 根據更新內容支援多欄位
    // const id = params.id;

    if (!id || (!status && paymentStatus === undefined)) {
      return NextResponse.json({ error: "缺少更新欄位" }, { status: 400 });
    }

    const updates = {
      updatedAt: new Date().toISOString(),
    };

    if (status) updates.status = status;
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;

    const { data, error } = await supabase
      .from('Order')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error("訂單更新錯誤:", error);
    return NextResponse.json(
      { error: error.message || "伺服器內部錯誤" },
      { status: 500 }
    );
  }
}
