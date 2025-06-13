import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

// 自訂函式，回傳台北時間的 ISO 格式字串（去掉末尾的 Z）
function getTaipeiISOTime() {
  const date = new Date();
  // 台灣時區是 UTC+8，以下是簡單加八小時的作法
  const taipeiTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return taipeiTime.toISOString().replace('Z', '');
}

export async function POST(request) {
  console.log("POST request received");
  
  const session = await getServerSession(authOptions);
  console.log("Session:", session);
  
  if (!session || !session.user) {
    console.log("未登入");
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const cookieStore = await cookies();  // 注意要 await
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const body = await request.json();
    const { items, totalAmount, paymentStatus = false } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "訂單項目為空" }, { status: 400 });
    }

    const createdAt = getTaipeiISOTime();
    const updatedAt = getTaipeiISOTime();

    // 新增訂單
    const { data: order, error: orderError } = await supabase
      .from("Order")
      .insert([
        {
          customerId: session.user.id,
          totalAmount,
          status: "PENDING",
          paymentStatus,
          createdAt,
          updatedAt,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 新增訂單項目
    const orderItems = items.map((item) => ({
      orderId: order.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      specialRequest: item.specialRequest || "",
    }));

    const { error: itemError } = await supabase.from("OrderItem").insert(orderItems);
    if (itemError) throw itemError;

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("伺服器錯誤", err);
    return NextResponse.json({ error: err.message || "伺服器錯誤" }, { status: 500 });
  }
}

// 取得所有訂單
export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  try {
    const { data, error } = await supabase
      .from("Order")
      .select(`
        id, createdAt, totalAmount, status, paymentStatus, completedAt,
        items:OrderItem (
          id,
          quantity,
          specialRequest,
          menuItem:MenuItem (
            name,
            price
          )
        )
      `)
      // .eq("customerId", user.id)  // 若要過濾該使用者的訂單可開啟
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("伺服器錯誤", err);
    return NextResponse.json({ error: err.message || "伺服器錯誤" }, { status: 500 });
  }
}

// 更新訂單狀態
export async function PUT(request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { id, status } = await request.json();
    
    const updatedAt = getTaipeiISOTime();

    // 更新订单状态及时间戳
    const { data, error } = await supabase
      .from('Order')
      .update({ 
        status,
        updatedAt
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error("更新订单错误:", error);
      return NextResponse.json({ error: "更新订单失败" }, { status: 500 });
    }

    return NextResponse.json(data[0]);
    
  } catch (error) {
    console.error("PUT /api/auth/orders 错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
