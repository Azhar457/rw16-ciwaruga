"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
interface LokerData {
  id: number;
  posisi: string;
  perusahaan: string;
  deskripsi: string;
  gambar_url: string;
  requirements: string;
  salary_range: string;
  lokasi: string;
  contact_method: string;
  contact_person: string;
  status_aktif: string;
  admin_poster: string;
  deadline: string;
  created_at: string;
  updated_at: string;
}

const defaultForm: Omit<
  LokerData,
  "id" | "created_at" | "updated_at" | "admin_poster" | "status_aktif"
> = {
  posisi: "",
  perusahaan: "",
  deskripsi: "",
  gambar_url: "",
  requirements: "",
  salary_range: "",
  lokasi: "",
  contact_method: "",
  contact_person: "",
  deadline: "",
};

export default function AdminLokerPage() {
  const [lokerList, setLokerList] = useState<LokerData[]>([]);
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchLoker();
  }, []);

  async function fetchLoker() {
    setLoading(true);
    try {
      const res = await fetch("/api/loker");
      const data = await res.json();
      setLokerList(Array.isArray(data) ? data : []);
    } catch {
      setError("Gagal mengambil data loker");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit(loker: LokerData) {
    setEditingId(loker.id);
    setForm({
      posisi: loker.posisi,
      perusahaan: loker.perusahaan,
      deskripsi: loker.deskripsi,
      gambar_url: loker.gambar_url,
      requirements: loker.requirements,
      salary_range: loker.salary_range,
      lokasi: loker.lokasi,
      contact_method: loker.contact_method,
      contact_person: loker.contact_person,
      deadline: loker.deadline,
    });
    setError("");
    setSuccess("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus loker ini?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/loker", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess("Berhasil menghapus loker");
        fetchLoker();
      } else {
        setError(result.message || "Gagal menghapus loker");
      }
    } catch {
      setError("Gagal menghapus loker");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        status_aktif: "Tidak Aktif",
        admin_poster: "Admin", // Atur sesuai user login jika sudah ada
      };
      let res, result;
      if (editingId) {
        res = await fetch("/api/loker", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingId }),
        });
        result = await res.json();
      } else {
        res = await fetch("/api/loker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        result = await res.json();
      }
      if (result.success) {
        setSuccess(
          editingId ? "Berhasil update loker" : "Berhasil tambah loker"
        );
        setForm(defaultForm);
        setEditingId(null);
        fetchLoker();
      } else {
        setError(result.message || "Gagal simpan loker");
      }
    } catch {
      setError("Gagal simpan loker");
    } finally {
      setLoading(false);
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(defaultForm);
    setError("");
    setSuccess("");
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2">
      <h2 className="text-2xl font-bold mb-4">
        {editingId ? "Edit Lowongan" : "Tambah Lowongan Kerja"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-2 mb-8">
        <input
          name="posisi"
          value={form.posisi}
          onChange={handleChange}
          placeholder="Posisi"
          required
          className="border px-2 py-1 w-full"
        />
        <input
          name="perusahaan"
          value={form.perusahaan}
          onChange={handleChange}
          placeholder="Perusahaan"
          required
          className="border px-2 py-1 w-full"
        />
        <textarea
          name="deskripsi"
          value={form.deskripsi}
          onChange={handleChange}
          placeholder="Deskripsi"
          required
          className="border px-2 py-1 w-full"
        />
        <input
          name="gambar_url"
          value={form.gambar_url}
          onChange={handleChange}
          placeholder="URL Gambar"
          required
          className="border px-2 py-1 w-full"
        />
        <input
          name="requirements"
          value={form.requirements}
          onChange={handleChange}
          placeholder="Persyaratan"
          required
          className="border px-2 py-1 w-full"
        />
        <input
          name="salary_range"
          value={form.salary_range}
          onChange={handleChange}
          placeholder="Rentang Gaji"
          required
          className="border px-2 py-1 w-full"
        />
        <input
          name="lokasi"
          value={form.lokasi}
          onChange={handleChange}
          placeholder="Lokasi"
          required
          className="border px-2 py-1 w-full"
        />
        <select
          name="contact_method"
          value={form.contact_method}
          onChange={handleChange}
          required
          className="border px-2 py-1 w-full"
        >
          <option value="">Metode Kontak</option>
          <option value="Email">Email</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Telepon">Telepon</option>
        </select>
        <input
          name="contact_person"
          value={form.contact_person}
          onChange={handleChange}
          placeholder="Kontak Person"
          required
          className="border px-2 py-1 w-full"
        />
        <input
          name="deadline"
          type="date"
          value={form.deadline}
          onChange={handleChange}
          required
          className="border px-2 py-1 w-full"
        />
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Memproses..." : editingId ? "Update" : "Tambah"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Batal
            </button>
          )}
        </div>
      </form>
      <h2 className="text-xl font-bold mb-2">Daftar Loker</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Gambar</th>
              <th className="p-2 border">Posisi</th>
              <th className="p-2 border">Perusahaan</th>
              <th className="p-2 border">Deskripsi</th>
              <th className="p-2 border">Persyaratan</th>
              <th className="p-2 border">Gaji</th>
              <th className="p-2 border">Lokasi</th>
              <th className="p-2 border">Kontak</th>
              <th className="p-2 border">Deadline</th>
              <th className="p-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {lokerList.map((loker) => (
              <tr key={loker.id}>
                <td className="border p-2">
                  <Image
                    width={128}
                    height={80}
                    src={loker.gambar_url}
                    alt={loker.posisi}
                    className="w-32 h-20 object-cover rounded"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/128x80?text=No+Image")
                    }
                  />
                </td>
                <td className="border p-2">{loker.posisi}</td>
                <td className="border p-2">{loker.perusahaan}</td>
                <td className="border p-2">{loker.deskripsi}</td>
                <td className="border p-2">{loker.requirements}</td>
                <td className="border p-2">{loker.salary_range}</td>
                <td className="border p-2">{loker.lokasi}</td>
                <td className="border p-2">
                  {loker.contact_method}: {loker.contact_person}
                </td>
                <td className="border p-2">{loker.deadline}</td>
                <td className="border p-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    onClick={() => handleEdit(loker)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(loker.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {lokerList.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center p-4">
                  Tidak ada data loker.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
