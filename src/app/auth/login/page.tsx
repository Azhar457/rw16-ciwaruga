"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/loadingSpinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect berdasarkan role
        switch (result.user.role) {
          case "admin":
            router.push("/dashboard/admin");
            break;
          case "ketua_rw":
            router.push("/dashboard/rw");
            break;
          case "ketua_rt":
            router.push("/dashboard/rt");
            break;
          case "warga":
            router.push("/dashboard/warga");
            break;
          default:
            router.push("/dashboard");
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Login RW 16 Ciwaruga
          </h1>
          <p className="text-gray-600">Masuk ke dashboard warga</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Masuk Akun</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="nama@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : "Masuk"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Belum punya akun? Hubungi admin RW untuk pendaftaran.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
