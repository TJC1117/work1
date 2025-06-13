import { supabase } from "@/lib/supabaseClient"; 

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

    const updatedAt = new Date().toISOString();
    const createdAt = new Date().toISOString();

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
