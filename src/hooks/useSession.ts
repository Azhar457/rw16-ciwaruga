import { useEffect, useState } from "react";

interface SessionUser {
  id: number;
  email: string;
  role: string;
  rt_akses: string;
  rw_akses: string;
  nama_lengkap: string;
  subscription_status: string;
  subscription_end: string;
  loginTime: string;
}

interface UseSessionResult {
  session: { user: SessionUser } | null;
  loading: boolean;
}

export function useSession(): UseSessionResult {
  const [session, setSession] = useState<{ user: SessionUser } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/account/session", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setSession({ user: data.user });
          } else {
            setSession(null);
          }
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  return { session, loading };
}
