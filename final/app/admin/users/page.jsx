"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const roleLabels = {
  CUSTOMER: "顧客",
  STAFF: "店員",
  CHEF: "廚師",
  OWNER: "管理員",
};

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("User") // 確認你Supabase資料表名稱是 User（注意大小寫）
        .select("id, name, email, role, banned, createdAt, updatedAt")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("取得使用者資料失敗", error?.message || error);
      } else {
        // Supabase 會回傳一個陣列
        // 如果欄位名稱是 banned，前端使用時要對應一致
        setUsers(
          data.map((user) => ({
            ...user,
            isBanned: user.banned,
          }))
        );
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    // 你可以改成呼叫你自己的API，或直接用Supabase更新
    const { error } = await supabase
      .from("User")
      .update({ role: newRole })
      .eq("id", id);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } else {
      console.error("更新角色失敗", error);
    }
  };

  const toggleBan = async (id, currentBanned) => {
    const { error } = await supabase
      .from("User")
      .update({ banned: !currentBanned })
      .eq("id", id);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isBanned: !currentBanned } : u
        )
      );
    } else {
      console.error("更新停權狀態失敗", error);
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.name}${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-orange-100 via-pink-100 to-red-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">👥 使用者管理</h1>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋名稱或 Email..."
          className="w-full mb-6 px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-400"
        />

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-20 bg-white rounded-lg shadow"
              />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredUsers.map((user) => (
              <motion.div
                layout
                key={user.id}
                className="bg-white rounded-xl shadow-lg p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                <p className="text-xs text-gray-500 mb-2">
                  建立時間：{new Date(user.createdAt).toLocaleDateString()}
                </p>

                <label className="text-sm font-medium text-gray-700">角色</label>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="block w-full mt-1 px-3 py-2 border rounded focus:outline-none focus:ring-pink-400"
                >
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => toggleBan(user.id, user.isBanned)}
                  className={`mt-4 w-full px-4 py-2 text-white rounded-md ${
                    user.isBanned
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-500 hover:bg-red-600"
                  } transition`}
                >
                  {user.isBanned ? "解除停權" : "停權用戶"}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
