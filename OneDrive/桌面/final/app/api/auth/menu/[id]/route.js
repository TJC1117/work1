import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, description, price, imageUrl, isAvailable } = body;

    if (!id) {
      return NextResponse.json({ error: "缺少菜單 ID" }, { status: 400 });
    }

    const updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('MenuItem')
      .update({
        name,
        description,
        price,
        imageUrl,
        isAvailable,
        updatedAt,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "更新失敗：" + error.message }, { status: 500 });
  }
}
