import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "請填寫 email 和密碼" }, { status: 400 });
    }

    // 從 Supabase 查詢使用者
    const { data, error } = await supabase
      .from("User") // 請確認資料表名稱正確
      .select("*")
      .eq("email", email)
      .single(); // 確保只取一筆

    if (error || !data) {
      return NextResponse.json({ message: "找不到使用者" }, { status: 401 });
    }

    // 比對密碼（假設資料表中有加密密碼欄位 password）
    const isMatch = await bcrypt.compare(password, data.password);

    if (!isMatch) {
      return NextResponse.json({ message: "密碼錯誤" }, { status: 401 });
    }

    // 移除密碼欄位再回傳
    const { password: _, ...userWithoutPassword } = data;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "伺服器錯誤" }, { status: 500 });
  }
}
