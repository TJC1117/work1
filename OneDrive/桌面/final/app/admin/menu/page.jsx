"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import Image from "next/image";

export default function MenuManagementPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const [newItem, setNewItem] = useState({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        isAvailable: true,
    });
    const [editingId, setEditingId] = useState(null);
    const [editItem, setEditItem] = useState({});

    useEffect(() => {
        const getMenu = async () => {
            try {
                const response = await fetch("/api/auth/menu");
                if (!response.ok) {
                    console.error("API 回傳錯誤");
                    return;
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    const fixedData = data.map(item => ({
                        ...item,
                        price: parseFloat(item.price || 0), // 確保 price 是數字
                    }));
                    setMenuItems(fixedData);
                } else {
                    console.error("API 回傳資料非陣列:", data);
                    setMenuItems([]);
                }

            } catch (error) {
                console.error("取得菜單時發生錯誤:", error);
                setMenuItems([]);
            }
        };
        getMenu();
    }, []);

    const handleCreate = async (e) => {
  e.preventDefault();
  try {
    // 把價格轉成浮點數，確保送到後端的是數字
    const itemToSend = {
      ...newItem,
      price: parseFloat(newItem.price),
    };

    const response = await fetch('/api/auth/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemToSend), // 傳入正確的物件
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || '新增餐點失敗');
    }

    const createdData = await response.json();

    setMenuItems((prev) => [...prev, createdData]);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      isAvailable: true,
    });
    setIsCreating(false);
    setImageFile(null);
  } catch (error) {
    console.error('新增餐點失敗:', error.message);
    alert('新增餐點失敗，請稍後再試。');
  }
};



const handleEdit = async (id) => {
  try {
    const updatedItemToSend = {
      ...editItem,
      price: isNaN(parseFloat(editItem.price)) ? 0 : parseFloat(editItem.price),
    };

    const response = await fetch(`/api/auth/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItemToSend),
    });

    const text = await response.text();

    if (!response.ok) {
      let errorMessage = "更新失敗";
      try {
        const errorJson = JSON.parse(text);
        if (errorJson.error) errorMessage = errorJson.error;
      } catch {
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const updatedItem = JSON.parse(text);

    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? updatedItem : item))
    );
    setEditingId(null);
    setEditItem({});
    alert("更新成功！");
  } catch (error) {
    console.error("更新失敗:", error);
    alert(`更新失敗: ${error.message}`);
  }
};


    // 新增：開始編輯，設定 editingId 和編輯用的狀態
    const startEditing = (item) => {
        setEditingId(item.id);
        setEditItem(item);
    };

    // 新增：取消編輯，清空 editingId 和 editItem
    const cancelEdit = () => {
        setEditingId(null);
        setEditItem({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-8 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">
                        🍱 菜單管理
                    </h1>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-2 rounded-md shadow hover:opacity-90 transition w-full sm:w-auto"
                    >
                        新增菜單
                    </button>
                </div>

                {isCreating && (
  <div className="bg-white p-6 rounded-lg shadow-lg mb-10">
    <h2 className="text-xl font-semibold mb-4">新增餐點</h2>
    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 名稱 */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">名稱</label>
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
          required
        />
      </div>

      {/* 價格 */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">價格</label>
        <input
          type="number"
          value={newItem.price}
          onChange={(e) =>
            setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })
          }
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
          required
        />
      </div>

      {/* 描述 */}
      <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-700">描述</label>
        <textarea
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* 圖片上傳 */}
      <div className="md:col-span-2">
        <label className="block mb-1 text-sm font-medium text-gray-700">圖片上傳</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setImageFile(file);
          }}
          className="w-auto border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
        />
        <button
          type="button"
          onClick={async () => {
            if (!imageFile) return alert("請先選擇圖片");

            const fileExt = imageFile.name.split(".").pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `menu/${fileName}`;

            const { data, error } = await supabase.storage
              .from("uploads")
              .upload(filePath, imageFile);

            if (error) {
              console.error("上傳失敗", error.message);
              alert("圖片上傳失敗！");
              return;
            }

            const { data: urlData } = supabase.storage
              .from("uploads")
              .getPublicUrl(filePath);

            setNewItem((prev) => ({
              ...prev,
              imageUrl: urlData.publicUrl,
            }));

            setImageFile(null); // 清除暫存檔案
          }}
          className="mt-2 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
        >
          上傳圖片
        </button>

        {newItem.imageUrl && (
          <img
            src={newItem.imageUrl}
            alt="預覽圖片"
            className="mt-4 h-32 object-contain border rounded"
          />
        )}
      </div>

      {/* 按鈕 */}
      <div className="flex flex-col sm:flex-row gap-4 md:col-span-2">
        <button
          type="submit"
          className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-md shadow hover:opacity-90 transition"
        >
          新增
        </button>
        <button
          type="button"
          onClick={() => setIsCreating(false)}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          取消
        </button>
      </div>
    </form>
  </div>
)}


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) =>
                        editingId === item.id ? (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-lg p-5 relative"
                            >
                                <h3 className="text-lg font-bold text-gray-800 mb-4">
                                    編輯餐點
                                </h3>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleEdit(item.id);
                                    }}
                                    className="space-y-4"
                                >
                                    <label className="block mb-1 ms-2 font-medium text-gray-700">
                                        名稱
                                    </label>
                                    <input
                                        type="text"
                                        value={editItem.name}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                        required
                                        placeholder="名稱"
                                    />
                                    <label className="block mb-1 ms-2 font-medium text-gray-700">
                                        價格
                                    </label>
                                    <input
                                        type="number"
                                        value={editItem.price}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                price: parseFloat(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                        required
                                        placeholder="價格"
                                    />
                                    <label className="block mb-1 ms-2 font-medium text-gray-700">
                                        敘述
                                    </label>
                                    <textarea
                                        value={editItem.description}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                        placeholder="描述"
                                    />
                                    <label className="block mb-1 ms-2 font-medium text-gray-700">
                                        圖片URL
                                    </label>
                                    <input
                                        type="text"
                                        value={editItem.imageUrl}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                imageUrl: e.target.value,
                                            })
                                        }
                                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-400"
                                        placeholder="圖片 URL"
                                    />
                                    <label className="inline-flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={editItem.isAvailable}
                                            onChange={(e) =>
                                                setEditItem({
                                                    ...editItem,
                                                    isAvailable:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        <span>供應中</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-md shadow hover:opacity-90 transition"
                                        >
                                            儲存
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition relative"
                            >
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={400}
                                    height={250}
                                    className="rounded-md w-full h-48 object-cover mb-4"
                                />
                                <h3 className="text-lg font-bold text-gray-800 mb-1">
                                    {item.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                                    {item.description}
                                </p>
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <span className="text-pink-600 font-semibold text-lg">
                                    ${parseFloat(item.price || 0).toFixed(2)}
                                    </span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                                            item.isAvailable
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {item.isAvailable ? "供應中" : "已下架"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => startEditing(item)}
                                    className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-red-600 text-white text-sm rounded-lg shadow-md hover:from-pink-600 hover:to-red-700 hover:shadow-lg transition duration-300 ease-in-out"
                                >
                                    編輯
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
