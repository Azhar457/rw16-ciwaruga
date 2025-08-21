"use client";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (
      !loading &&
      (!session?.user || !["admin", "rw"].includes(session.user.role))
    ) {
      router.replace("/auth/login");
    }
  }, [session, loading, router]);

  if (loading || !session?.user) return <div>Loading...</div>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
    </main>
  );
}
