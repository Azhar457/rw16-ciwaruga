"use client";
import { useEffect, useState } from "react";

interface UmkmData {
  id: number;
  nama_usaha: string;
  pemilik_nik_encrypted: string;
  jenis_usaha: string;
  alamat: string;
  no_hp: number;
  deskripsi: string;
  foto_url: string;
  status_verifikasi: string;
  admin_approver: string;
  created_at: string;
  updated_at: string;
}

export default function UmkmPage() {
  const [umkm, setUmkm] = useState<UmkmData[]>([]);
  const [form, setForm] = useState({
    nama_usaha: "",
    jenis_usaha: "",
    alamat: "",
    no_hp: "",
    deskripsi: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/umkm");
        const result = await response.json();
        // Handle struktur data dari API
        if (result.success && Array.isArray(result.data)) {
          setUmkm(result.data);
        } else {
          setUmkm([]);
        }
      } catch (error) {
        console.error("Error fetching UMKM:", error);
        setUmkm([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/umkm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({
        nama_usaha: "",
        jenis_usaha: "",
        alamat: "",
        no_hp: "",
        deskripsi: "",
      });

      // Refresh data
      const response = await fetch("/api/umkm");
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setUmkm(result.data);
      }
    } catch (error) {
      console.error("Error adding UMKM:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Verified: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Daftar UMKM</h1>

      {/* Grid Cards UMKM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {umkm.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-900">
                {item.nama_usaha}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                  item.status_verifikasi
                )}`}
              >
                {item.status_verifikasi}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Jenis:</span> {item.jenis_usaha}
              </p>
              <p>
                <span className="font-medium">Alamat:</span> {item.alamat}
              </p>
              <p>
                <span className="font-medium">Kontak:</span> {item.no_hp}
              </p>
              <p>
                <span className="font-medium">Deskripsi:</span> {item.deskripsi}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t text-xs text-gray-500">
              <p>
                Dibuat: {new Date(item.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {umkm.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Belum ada data UMKM
        </div>
      )}

      {/* Form Tambah UMKM */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tambah UMKM Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Usaha"
              value={form.nama_usaha}
              onChange={(e) => setForm({ ...form, nama_usaha: e.target.value })}
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Jenis Usaha"
              value={form.jenis_usaha}
              onChange={(e) =>
                setForm({ ...form, jenis_usaha: e.target.value })
              }
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Alamat"
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <input
            type="tel"
            placeholder="Nomor HP"
            value={form.no_hp}
            onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <textarea
            placeholder="Deskripsi Usaha"
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Tambah UMKM
          </button>
        </form>
      </div>
    </div>
  );
}
