import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); 
 const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();


  // 🔽 查詢訂單資料
  try {
    
    const { data: kitchenOrders, error: fetchError } = await supabase
      .from("Order")
      .select(`
        id,
        status,
        totalAmount,
        completedAt,
        user:User (
        name
        ),
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

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch kitchen orders" }, { status: 500 });
    }

    return NextResponse.json(kitchenOrders);
  } catch (error) {
    console.error("GET /api/auth/orders/kitchen error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}