"use client";

import { useEffect, useState, useRef } from "react";

async function updateOrderStatus(id, status) {
  const res = await fetch(`/api/auth/orders`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });

    if (!res.ok) throw new Error("無法更新訂單狀態");
    return res.json();
}


export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimer = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/auth/orders/kitchen");
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("獲取訂單失敗:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    refreshTimer.current = setInterval(fetchData, 10000);
    return () => clearInterval(refreshTimer.current);
  }, []);

  const handleCompleteOrder = async (orderId) => {
    try {
      setIsLoading(true);
      await updateOrderStatus(orderId, "READY");
      setOrders(prev =>
        prev.map(order => order.id === orderId ? { ...order, status: "READY" } : order)
      );
    } catch (err) {
      console.error("更新失敗:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">👨‍🍳 廚房訂單看板</h1>
      {isLoading ? (
        <div className="text-center text-gray-500 mt-12 text-lg">載入中...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 mt-12 text-lg">暫無待處理訂單 🍳</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-md p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">訂單 #{order.id.slice(0, 8)}</h2>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  {order.status}
                </span>
              </div>
              <div className="mb-3 text-right text-sm text-gray-600">
                 NT$ {order.totalAmount.toFixed(2)}
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-2">餐點明細</h3>
                <ul className="space-y-2 text-sm">
                  {order.items.map(item => (
                    <li key={item.id}>
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {item.menuItem.name} × {item.quantity}
                        </span>
                        <span className="text-gray-600">
                          NT$ {(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {item.specialRequest && (
                        <div className="mt-1 text-yellow-700 bg-yellow-50 border rounded px-2 py-1">
                          <strong>備註：</strong> {item.specialRequest}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleCompleteOrder(order.id)}
                className="mt-5 w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition"
              >
                ✅ 標記為已完成
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
