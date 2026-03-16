"use client";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailParam, otp }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess("Verifikasi berhasil! Mengalihkan ke login...");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error("Verify error:", error);
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    if (!emailParam) {
        return (
            <div className="text-center">
                <p className="text-red-500 mb-4">Email invalid.</p>
                <Link href="/auth/register" className="text-blue-600 underline">
                    Kembali ke Register
                </Link>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-semibold text-center">Verifikasi OTP</h2>
                <p className="text-sm text-gray-500 text-center mt-2">
                    Kode verifikasi telah dikirim ke <strong>{emailParam}</strong>
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kode OTP (6 digit)
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                            placeholder="000000"
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? " " : "Verifikasi"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Tidak menerima kode?{" "}
                    <button className="text-blue-600 hover:underline">
                        Kirim Ulang
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Suspense fallback={<div>Loading...</div>}>
                    <VerifyContent />
                </Suspense>
            </div>
        </div>
    );
}
