// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

const owners = ["farny100006306826831@gmail.com"];
const chefs = ["tsai20041117@gmail.com"];
const staffs = ["farny931117@gmail.com"];

 const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        // 角色設定
        if (owners.includes(user.email)) {
          token.role = "OWNER";
        } else if (chefs.includes(user.email)) {
          token.role = "CHEF";
        } else if (staffs.includes(user.email)) {
          token.role = "STAFF";
        } else {
          token.role = "CUSTOMER";
        }

        // 查 supabase 使用者 ID
        const { data: supaUser } = await supabaseAdmin
          .from("User") // 確認這是你存 email 的資料表，否則換成 "auth.users"
          .select("id")
          .eq("email", user.email)
          .single();

        if (supaUser?.id) {
          token.supaUserId = supaUser.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.supaUserId ?? null; // ⬅️ 給前端用
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };