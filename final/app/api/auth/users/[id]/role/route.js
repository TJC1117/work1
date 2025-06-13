import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 取得指定使用者的角色
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const result = await pool.query(
      'SELECT "role" FROM "User" WHERE "id" = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
    }

    return NextResponse.json({ role: result.rows[0].role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}

// 更新指定使用者的角色
export async function PUT(request, { params }) {
  const { id } = params;

  try {
    const { role } = await request.json();

    if (!role) {
      return NextResponse.json({ error: "缺少 role 欄位" }, { status: 400 });
    }

    const result = await pool.query(
      'UPDATE "User" SET "role" = $1 WHERE "id" = $2 RETURNING "id", "role"',
      [role, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
