// app/api/auth/users/[id]/ban/route.js

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// PATCH 切換 banned 狀態
export async function PATCH(request, { params }) {
  const { id } = params;
  try {
    // 先取得目前 banned 狀態
    const current = await pool.query(
      'SELECT "banned" FROM "User" WHERE "id" = $1',
      [id]
    );

    if (current.rows.length === 0) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
    }

    const currentBanned = current.rows[0].banned ?? false;

    // 切換 banned 狀態
    const updated = await pool.query(
      'UPDATE "User" SET "banned" = $1 WHERE "id" = $2 RETURNING "id", "banned"',
      [!currentBanned, id]
    );

    return NextResponse.json({ user: updated.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
