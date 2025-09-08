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
  verified_by?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<
    Partial<AccountData & { password?: string }>
  >({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<
    Partial<AccountData & { password: string }>
  >({});
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

  function handleAddChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess("Berhasil tambah akun");
        setShowAdd(false);
        setAddForm({});
        fetchAccounts();
      } else {
        setError(result.message || "Gagal tambah akun");
      }
    } catch {
      setError("Gagal tambah akun");
    }
  }

  if (loading || !session?.user || session.user.role !== "developer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  if (accountsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Memuat data akun...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard Developer
          </h1>
          <p className="text-gray-600 mt-2">Kelola semua akun RW 16 Ciwaruga</p>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/auth/login", { method: "DELETE" });
            router.replace("/auth/login");
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
        >
          Logout
        </button>
      </div>

      <Card className="border-0 shadow-xl rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Daftar Akun</h2>
            <button
              className="bg-white text-indigo-600 px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
              onClick={() => {
                setShowAdd(true);
                setError("");
                setSuccess("");
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Akun
            </button>
          </div>
        </div>
        <CardContent className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RT Akses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RW Akses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Lengkap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Aktif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription End
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acc.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          acc.role === "developer"
                            ? "bg-purple-100 text-purple-800"
                            : acc.role.includes("admin")
                            ? "bg-blue-100 text-blue-800"
                            : acc.role.includes("ketua")
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {acc.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acc.rt_akses || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acc.rw_akses || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acc.nama_lengkap}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          acc.status_aktif === "Aktif"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {acc.status_aktif}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acc.last_login
                        ? new Date(acc.last_login).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acc.subscription_status || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acc.subscription_end
                        ? new Date(acc.subscription_end).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(acc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acc.verified_by || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md mr-2 transition-colors duration-200 text-xs font-medium"
                        onClick={() => handleEdit(acc)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition-colors duration-200 text-xs font-medium"
                        onClick={() => handleDelete(acc.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={12} className="text-center py-10">
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.004-5.824-2.574M15 6.306a7.962 7.962 0 00-5.824-2.574M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="mt-2">Tidak ada data akun.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal/Form Tambah Akun */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Tambah Akun Baru
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => {
                  setShowAdd(false);
                  setAddForm({});
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    value={addForm.email || ""}
                    onChange={handleAddChange}
                    placeholder="Email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={addForm.password || ""}
                    onChange={handleAddChange}
                    placeholder="Password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={addForm.role || ""}
                  onChange={handleAddChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                >
                  <option value="">Pilih Role</option>
                  <option value="admin">Admin</option>
                  <option value="admin_rt">Admin RT</option>
                  <option value="admin_rw">Admin RW</option>
                  <option value="admin_bph">Admin BPH</option>
                  <option value="admin_lembaga">Admin Lembaga</option>
                  <option value="ketua_rw">Ketua RW</option>
                  <option value="ketua_rt">Ketua RT</option>
                  <option value="developer">Developer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RT Akses
                  </label>
                  <input
                    name="rt_akses"
                    value={addForm.rt_akses || ""}
                    onChange={handleAddChange}
                    placeholder="RT Akses"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RW Akses
                  </label>
                  <input
                    name="rw_akses"
                    value={addForm.rw_akses || ""}
                    onChange={handleAddChange}
                    placeholder="RW Akses"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  name="nama_lengkap"
                  value={addForm.nama_lengkap || ""}
                  onChange={handleAddChange}
                  placeholder="Nama Lengkap"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Simpan Akun
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300 font-medium"
                  onClick={() => {
                    setShowAdd(false);
                    setAddForm({});
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Edit Akun */}
      {editId && (
        <Card className="mt-8 border-0 shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
            <h2 className="text-xl font-semibold text-white">Edit Akun</h2>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (kosongkan jika tidak diubah)
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password || ""}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                >
                  <option value="">Pilih Role</option>
                  <option value="admin">Admin</option>
                  <option value="admin_rt">Admin RT</option>
                  <option value="admin_rw">Admin RW</option>
                  <option value="admin_bph">Admin BPH</option>
                  <option value="admin_lembaga">Admin Lembaga</option>
                  <option value="ketua_rw">Ketua RW</option>
                  <option value="ketua_rt">Ketua RT</option>
                  <option value="warga">Warga</option>
                  <option value="developer">Developer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RT Akses
                  </label>
                  <input
                    name="rt_akses"
                    value={form.rt_akses || ""}
                    onChange={handleChange}
                    placeholder="RT Akses"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RW Akses
                  </label>
                  <input
                    name="rw_akses"
                    value={form.rw_akses || ""}
                    onChange={handleChange}
                    placeholder="RW Akses"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  name="nama_lengkap"
                  value={form.nama_lengkap || ""}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Aktif
                </label>
                <select
                  name="status_aktif"
                  value={form.status_aktif || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                >
                  <option value="">Pilih Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Status
                  </label>
                  <input
                    name="subscription_status"
                    value={form.subscription_status || ""}
                    onChange={handleChange}
                    placeholder="Subscription Status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription End
                  </label>
                  <input
                    name="subscription_end"
                    type="date"
                    value={form.subscription_end || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verified By
                </label>
                <input
                  name="verified_by"
                  value={form.verified_by || ""}
                  onChange={handleChange}
                  placeholder="Verified By"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Update Akun
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300 font-medium"
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
