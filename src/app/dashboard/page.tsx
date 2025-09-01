"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

interface AccountData {
  id: number;
  email: string;
  role: string;
  rt_akses: string;
  rw_akses: string;
  nama_lengkap: string;
  status_aktif: string;
  last_login: string;
  subscription_status: string;
  subscription_end: string;
  created_at: string;
  verified_by: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<AccountData>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Hanya developer yang boleh akses
  useEffect(() => {
    if (!loading && (!session?.user || session.user.role !== "developer")) {
      router.replace("/auth/login");
    }
  }, [session, loading, router]);

  // Fetch akun
  useEffect(() => {
    if (session?.user && session.user.role === "developer") {
      fetchAccounts();
    }
  }, [session]);

  async function fetchAccounts() {
    setAccountsLoading(true);
    try {
      const res = await fetch("/api/account");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setError("Gagal mengambil data akun");
    } finally {
      setAccountsLoading(false);
    }
  }

  function handleEdit(account: AccountData) {
    setEditId(account.id);
    setForm(account);
    setError("");
    setSuccess("");
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editId }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess("Berhasil update akun");
        setEditId(null);
        setForm({});
        fetchAccounts();
      } else {
        setError(result.message || "Gagal update akun");
      }
    } catch {
      setError("Gagal update akun");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus akun ini?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess("Berhasil hapus akun");
        fetchAccounts();
      } else {
        setError(result.message || "Gagal hapus akun");
      }
    } catch {
      setError("Gagal hapus akun");
    }
  }

  if (loading || !session?.user || session.user.role !== "developer") {
    return <div>Loading...</div>;
  }

  if (accountsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Developer
          </h1>
          <p className="text-gray-600 mt-2">Kelola semua akun RW 16 Ciwaruga</p>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/auth/login", { method: "DELETE" });
            router.replace("/auth/login");
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Daftar Akun</h2>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">{success}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">RT Akses</th>
                  <th className="p-2 border">RW Akses</th>
                  <th className="p-2 border">Nama Lengkap</th>
                  <th className="p-2 border">Status Aktif</th>
                  <th className="p-2 border">Last Login</th>
                  <th className="p-2 border">Subscription Status</th>
                  <th className="p-2 border">Subscription End</th>
                  <th className="p-2 border">Created At</th>
                  <th className="p-2 border">Verified By</th>
                  <th className="p-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id}>
                    <td className="border p-2">{acc.email}</td>
                    <td className="border p-2">{acc.role}</td>
                    <td className="border p-2">{acc.rt_akses}</td>
                    <td className="border p-2">{acc.rw_akses}</td>
                    <td className="border p-2">{acc.nama_lengkap}</td>
                    <td className="border p-2">{acc.status_aktif}</td>
                    <td className="border p-2">{acc.last_login}</td>
                    <td className="border p-2">{acc.subscription_status}</td>
                    <td className="border p-2">{acc.subscription_end}</td>
                    <td className="border p-2">{acc.created_at}</td>
                    <td className="border p-2">{acc.verified_by}</td>
                    <td className="border p-2">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleEdit(acc)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded"
                        onClick={() => handleDelete(acc.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={12} className="text-center p-4">
                      Tidak ada data akun.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form Edit Akun */}
      {editId && (
        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Edit Akun</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-2">
              <input
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                placeholder="Email"
                required
                className="border px-2 py-1 w-full"
              />
              <select
                name="role"
                value={form.role || ""}
                onChange={handleChange}
                required
                className="border px-2 py-1 w-full"
              >
                <option value="">Role</option>
                <option value="admin">Admin</option>
                <option value="ketua_rw">Ketua RW</option>
                <option value="ketua_rt">Ketua RT</option>
                <option value="warga">Warga</option>
                <option value="developer">Developer</option>
              </select>
              <input
                name="rt_akses"
                value={form.rt_akses || ""}
                onChange={handleChange}
                placeholder="RT Akses"
                className="border px-2 py-1 w-full"
              />
              <input
                name="rw_akses"
                value={form.rw_akses || ""}
                onChange={handleChange}
                placeholder="RW Akses"
                className="border px-2 py-1 w-full"
              />
              <input
                name="nama_lengkap"
                value={form.nama_lengkap || ""}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                required
                className="border px-2 py-1 w-full"
              />
              <select
                name="status_aktif"
                value={form.status_aktif || ""}
                onChange={handleChange}
                required
                className="border px-2 py-1 w-full"
              >
                <option value="">Status Aktif</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              <input
                name="subscription_status"
                value={form.subscription_status || ""}
                onChange={handleChange}
                placeholder="Subscription Status"
                className="border px-2 py-1 w-full"
              />
              <input
                name="subscription_end"
                type="date"
                value={form.subscription_end || ""}
                onChange={handleChange}
                placeholder="Subscription End"
                className="border px-2 py-1 w-full"
              />
              <input
                name="verified_by"
                value={form.verified_by || ""}
                onChange={handleChange}
                placeholder="Verified By"
                className="border px-2 py-1 w-full"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Update
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => {
                    setEditId(null);
                    setForm({});
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
