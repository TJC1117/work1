// app/api/auth/orders/pending/route.js
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
        createdAt,
        items:OrderItem (
          id,
          quantity,
          menuItem:MenuItem (
            name,
            price
          )
        )
      `)
      .eq("status", "PENDING")
      .order("createdAt", { ascending: true });

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







// import { NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { authOptions } from "../../[...nextauth]/route";
// import { getServerSession } from "next-auth";

// export async function GET(request) {
//   const session = await getServerSession(authOptions);
//   console.log("Session:", session);

//   if (!session || !session.user) {
//     console.log("未登入");
//     return NextResponse.json({ error: "未登入" }, { status: 401 });
//   }

//   const cookieStore = await cookies();
//   const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
//   const userId = session.user.id;

//   try {
//     const { data: orders, error: fetchError } = await supabase
//       .from("Order")
//       .select(`
//         id,
//         totalAmount,
//         status,
//         createdAt,
//         paymentStatus,
//         items:OrderItem (
//           quantity,
//           menuItem:MenuItem (
//             name,
//             price
//           )
//         )
//       `)
//       .eq("status", "PENDING")
//       .order("createdAt", { ascending: false });

//     if (fetchError) {
//       console.error("Supabase 錯誤：", fetchError);
//       return NextResponse.json({ error: "訂單查詢失敗" }, { status: 500 });
//     }

//     return NextResponse.json(
//       { data: orders },
//       {
//         headers: {
//           "Cache-Control": "max-age=60",
//           "Access-Control-Allow-Origin": "*",
//         },
//       }
//     );
//   } catch (error) {
//     console.error("獲取訂單時發生錯誤:", error);
//     return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
//   }
// }

// export async function GET() {
//   const cookieStore = await cookies(); 
//  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
//  const userId = session.user.id;
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();


//   // 🔽 查詢訂單資料
//   try {
    
//     const { data: orders, error: fetchError } = await supabase
//       .from("Order")
//       .select(`
//         id,
//         totalAmount,
//         status,
//         createdAt,
//         paymentStatus,
//         items:OrderItem (
//           quantity,
//           menuItem:MenuItem (
//             name,
//             price
//           )
//         )
//       `)
//       // .eq("customerId", userId)
//       .eq("status", statusFilter)
//       .order("createdAt", { ascending: false })
//       .limit(limit);

//     if (fetchError) {
//       console.error("Supabase 錯誤：", fetchError);
//       return NextResponse.json({ error: "訂單查詢失敗" }, { status: 500 });
//     }

//     return NextResponse.json({ data: orders }, {
//       headers: {
//         "Cache-Control": "max-age=60",
//         "Access-Control-Allow-Origin": "*",
//       },
//     });

//   } catch (error) {
//     console.error("獲取訂單時發生錯誤:", error);
//     return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
//   }
// }