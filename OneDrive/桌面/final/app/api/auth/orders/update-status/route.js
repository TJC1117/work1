// app/api/auth/orders/update-status/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status in request body" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
