// app/api/auth/orders/confirm-payment/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    const { orderId } = await request.json();

      if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { error: "缺少或无效的订单ID" }, 
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: true,
          status: "PAID",       // 添加状态更新
          updatedAt: new Date() // 明确更新时间
        },
        include: { items: true } // 返回关联数据
      })
    ]);
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
