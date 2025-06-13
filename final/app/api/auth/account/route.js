import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getTaipeiISOTime(date = new Date()) {
  const taipeiTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return taipeiTime.toISOString().replace('Z', '');
}

function getDateRange(dateStr) {
  const startDate = new Date(dateStr);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);
  return { startDate, endDate };
}

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const url = new URL(request.url);
  const date = url.searchParams.get("date") || getTaipeiISOTime().split("T")[0];
  const { startDate, endDate } = getDateRange(date);

  try {
    const { data: orders, error } = await supabase
      .from("Order")
      .select(`
        id,
        totalAmount,
        completedAt,
        items:OrderItem (
          id,
          quantity,
          menuItem:MenuItem (
            name,
            price
          )
        )
      `)
      .eq("status", "COMPLETED")
      .gte("completedAt", getTaipeiISOTime(startDate))
      .lt("completedAt", getTaipeiISOTime(endDate));

    if (error) throw error;

    const total = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return NextResponse.json({ orders, total });
  } catch (err) {
    console.error("獲取訂單失敗:", err.message || err);
    return NextResponse.json({ error: "獲取訂單失敗" }, { status: 500 });
  }
}
