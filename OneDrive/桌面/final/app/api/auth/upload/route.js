import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req) {
  const supabase = createClient(
    supabaseUrl,
    supabaseKey,
  );

  try{
    const formData = await req.formData();
    const file = formData.get("file");

    if(!file || typeof file === "string"){
      return NextResponse.json({ success: false, error: "未提供檔案"}, { status: 404 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(`uploads`)
      .upload(fileName, buffer,{
        contentType: file.type,
        upsert: true,
      });

      if(error){
        throw error;
      }
      const res = supabase.storage.from(`uploads`).getPublicUrl(data.path);
      const publicUrl = res.data.publicUrl;

      return NextResponse.json({
        success: true,
        url: publicUrl,
      });
  } catch(err){
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: "伺服器發生錯誤"}, { status: 500 })
  }
}
