import { supabase } from "@/lib/supabaseClient"; 
function getTaipeiISOTime() {
  const date = new Date();
  // 台灣時區是 UTC+8
  const taipeiTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return taipeiTime.toISOString().replace('Z', '');
}
export async function GET(request) {
  const { data, error } = await supabase
    .from('MenuItem')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, isAvailable } = body;

    const updatedAt = getTaipeiISOTime();
    const createdAt = getTaipeiISOTime();

    const { data, error } = await supabase
      .from('MenuItem')
      .insert([{ name, description, price, imageUrl, isAvailable, createdAt, updatedAt }])
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
