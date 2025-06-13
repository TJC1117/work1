"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ReadyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [recorded, setRecorded] = useState(false); // 避免重複紀錄

  const fetchData = async (selectedDate) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/account?date=${selectedDate}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();

      const formattedOrders = data.orders.map((order) => ({
        id: order.id,
        amount: order.totalAmount,
        pickupTime: new Date(order.completedAt).toLocaleString("zh-TW", {
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        items: order.items.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
        })),
      }));

      setOrders(formattedOrders);
      setTotalAmount(data.total || 0);

      if (!recorded) {
        await recordTodayRevenue(selectedDate);
      }
    } catch (err) {
      console.error("獲取訂單失敗:", err);
      setOrders([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const recordTodayRevenue = async (targetDate) => {
    try {
      const res = await fetch("/api/auth/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: targetDate }),
      });
      const data = await res.json();
      console.log(data.message + "，金額：" + data.total + " 元");
      setRecorded(true);
    } catch (error) {
      console.error("紀錄營業額失敗:", error);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    setRecorded(false); // 日期改變，重置已紀錄狀態
    fetchData(newDate);
  };

  useEffect(() => {
    fetchData(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-red-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">📒 帳目管理</h1>

        <div className="mb-6 flex items-center gap-4">
          <label htmlFor="date" className="font-medium text-gray-700">
            選擇日期：
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={handleDateChange}
            className="border border-gray-300 rounded-md px-3 py-1"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        <p className="mb-4 font-semibold text-lg text-gray-700">
          {date} 營業額總計： <span className="text-red-500">{totalAmount} 元</span>
        </p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-24 bg-white rounded-lg shadow"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 mt-20 text-lg">
            🧾 目前沒有該日帳目紀錄
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-sm text-gray-600 list-disc pl-5 mb-2">
                  訂單 #{order.id}
                </h2>

                <ul className="text-sm text-gray-600 list-disc pl-5 mb-2">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} x {item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500">完成時間：{order.pickupTime}</p>
                <p className="text-xs text-gray-500">金額：{order.amount}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
