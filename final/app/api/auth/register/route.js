import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Pool } from "pg";


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // 避免 supabase self-signed 錯誤
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "所有欄位皆為必填" },
        { status: 400 }
      );
    }

    // 檢查 email 是否已註冊
    const existingUser = await pool.query(
      'SELECT id FROM "User" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Email 已被註冊" },
        { status: 400 }
      );
    }

    // 密碼加密
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date().toISOString();

    // 新增使用者，預設角色為 CUSTOMER
    const result = await pool.query(
      'INSERT INTO "User" (email, password, name, role ,"createdAt", "updatedAt", banned) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, name, role',
      [email, hashedPassword, name, "CUSTOMER", now, now, false]
    );

    const user = result.rows[0];

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("註冊失敗:", error);
    return NextResponse.json(
      { error: "伺服器錯誤" },
      { status: 500 }
    );
  }
}
