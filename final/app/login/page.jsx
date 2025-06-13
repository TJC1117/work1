"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password, name } = formData;

    if (!email || !password || (isRegister && !name)) {
      setError("所有欄位皆為必填");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(isRegister && { name }) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (isRegister ? "註冊失敗" : "登入失敗"));

      if (!isRegister) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/";
      } else {
        setIsRegister(false);
        setFormData({ email: "", password: "", name: "" });
        setError("註冊成功，請登入");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-300 via-pink-400 to-red-400 px-4">
      <div className="max-w-md w-full bg-white/30 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-8 transition-all">
        <h2 className="text-3xl font-extrabold text-center text-gray-700 drop-shadow mb-6">
          {isRegister ? "註冊帳號" : "登入帳號"}
        </h2>

        {error && (
          <div
            className={`mb-4 text-sm text-center font-medium p-2 rounded-md shadow-sm ${
              error.includes("成功")
                ? "text-green-700 bg-green-100"
                : "text-red-600 bg-red-100"
            }`}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <InputField
              label="名稱"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              autoFocus={true}
            />
          )}
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            label="密碼"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            extra={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-blue-600 underline ml-2"
              >
                {showPassword ? "隱藏" : "顯示"}
              </button>
            }
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-pink-500 text-white py-2 rounded-md ${
              isSubmitting ? "opacity-60 animate-pulse cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (isRegister ? "註冊中..." : "登入中...") : isRegister ? "註冊" : "登入"}
          </button>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => signIn("google")}
              className="w-full bg-white text-gray-800 border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center gap-2 shadow hover:bg-gray-50 transition"
            >
              <Image src="/google.png" alt="Google" width={24} height={24} />
              使用 Google {isRegister ? "註冊" : "登入"}
            </button>

            <button
              type="button"
              onClick={() => signIn("github")}
              className="w-full bg-white text-gray-800 border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center gap-2 shadow hover:bg-gray-50 transition"
            >
              <Image src="/github.png" alt="GitHub" width={24} height={24} />
              使用 GitHub {isRegister ? "註冊" : "登入"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            className="text-sm text-blue-800 underline hover:text-blue-600 transition"
            onClick={() => {
              setIsRegister((prev) => !prev);
              setError("");
              setFormData({ email: "", password: "", name: "" });
            }}
          >
            {isRegister ? "已有帳號？前往登入" : "尚未註冊？點我註冊"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, type, value, onChange, extra, autoFocus }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-gray-800 mb-1">
        {label} {extra}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white/80 text-gray-800 focus:ring-2 focus:ring-pink-400 focus:outline-none"
      />
    </div>
  );
}
