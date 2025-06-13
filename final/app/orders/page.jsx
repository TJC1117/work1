"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
  const getOrders = async () => {
    try {
       const res = await fetch("/api/auth/orders", {
          credentials: "include",
        });

      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      console.log("API 回傳:", data);

      if (!Array.isArray(data)) {
        console.error("API 回傳不是陣列", data);
        setError("伺服器回傳資料格式錯誤");
        setOrders([]);
        return;
      }

      setOrders(data);
      setError(null);
    } catch (error) {
        console.error("取得訂單錯誤:", error);
        setError(error.message || "取得訂單時發生錯誤");
        setOrders([]);
      }
  };

  getOrders();
}, []);




  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PREPARING":
        return "bg-blue-100 text-blue-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center sm:text-left text-gray-800">
          我的訂單
        </h1>

        {error && (
          <p className="text-red-600 text-center mb-6">
            錯誤：{error}
          </p>
        )}

        {!error && orders.length === 0 ? (
          <p className="text-gray-500 text-center sm:text-left">
            您目前沒有任何訂單。
          </p>
        ) : (
          Array.isArray(orders) &&
          orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => {
                const orderIdStr = String(order.id);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          訂單 #{orderIdStr.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`mt-2 sm:mt-0 px-3 py-2 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="mb-3 space-y-1">
                      <p className="text-gray-700">
                        <strong>總金額：</strong> ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className={order.paymentStatus ? "text-green-600" : "text-red-600"}>
                        <strong>付款狀態：</strong> {order.paymentStatus ? "已付款" : "未付款"}
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-700">
                        餐點內容：
                      </h4>
                      <ul className="space-y-2">
                        {Array.isArray(order.items) && order.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex justify-between text-sm text-gray-600"
                          >
                            <span>
                              {item.menuItem?.name || "未知餐點"} × {item.quantity}
                              {item.specialRequest && (
                                <span className="block text-xs text-gray-400">
                                  備註：{item.specialRequest}
                                </span>
                              )}
                            </span>
                            <span>
                              $
                              {(
                                (item.menuItem?.price || 0) * item.quantity
                              ).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {order.status === "READY" && !order.completedAt && (
                      <div className="mt-4 text-center sm:text-right">
                        <Link
                          href={`/orders/${order.id}/complete`}
                          className="inline-block bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-md hover:opacity-90 transition"
                        >
                          確認取餐
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
