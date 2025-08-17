"use client";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST ke API /auth/login
    console.log("Login:", form);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-80"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-3 p-2 border rounded"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </main>
  );
}
