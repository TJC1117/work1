import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies as getCookies } from 'next/headers';

function getTaipeiISOTime() {
  const date = new Date();
  // 台灣時區是 UTC+8
  const taipeiTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return taipeiTime.toISOString().replace('Z', '');
}

export async function PUT(request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const id = parts[parts.length - 1];

  const cookieStore = await getCookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { status, paymentStatus } = await request.json();

    if (!id || (!status && paymentStatus === undefined)) {
      return NextResponse.json({ error: "缺少更新欄位" }, { status: 400 });
    }

    const updates = {
      updatedAt: getTaipeiISOTime(),
    };

    if (status) {
      updates.status = status;
      if (status === "COMPLETED") {
        updates.completedAt = getTaipeiISOTime(); // ✅ 設定完成時間
      }
    }

    if (paymentStatus !== undefined) {
      updates.paymentStatus = paymentStatus;
    }

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
