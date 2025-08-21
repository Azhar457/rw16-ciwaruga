"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Card, CardContent } from "@/components/ui/Card";

export default function CreateLokerPage() {
  const [form, setForm] = useState({
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.replace("/auth/login");
    }
  }, [session, sessionLoading, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Status otomatis "Tidak Aktif" saat input
      const payload = {
        ...form,
        status_aktif: "Tidak Aktif",
      };
      const res = await fetch("/api/loker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(
          "Lowongan berhasil ditambahkan! Menunggu aktivasi Ketua RW."
        );
        setForm({
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
        });
        setTimeout(() => router.push("/loker"), 1500);
      } else {
        setError(result.message || "Gagal menambah lowongan.");
      }
    } catch {
      setError("Gagal menambah lowongan.");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto py-12 px-4">
        <Card>
          <CardContent>
            <h2 className="text-2xl font-bold mb-6">Tambah Lowongan Kerja</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ...form fields seperti sebelumnya... */}
              <input
                name="posisi"
                type="text"
                required
                placeholder="Posisi"
                value={form.posisi}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="perusahaan"
                type="text"
                required
                placeholder="Perusahaan"
                value={form.perusahaan}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <textarea
                name="deskripsi"
                required
                placeholder="Deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="gambar_url"
                type="url"
                required
                placeholder="URL Gambar"
                value={form.gambar_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="requirements"
                type="text"
                required
                placeholder="Persyaratan"
                value={form.requirements}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="salary_range"
                type="text"
                required
                placeholder="Rentang Gaji (misal: 2-3 jt)"
                value={form.salary_range}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="lokasi"
                type="text"
                required
                placeholder="Lokasi"
                value={form.lokasi}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <select
                name="contact_method"
                required
                value={form.contact_method}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Metode Kontak</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Telepon">Telepon</option>
              </select>
              <input
                name="contact_person"
                type="text"
                required
                placeholder="Kontak Person (email/no hp)"
                value={form.contact_person}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="deadline"
                type="date"
                required
                value={form.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <div className="text-sm text-gray-500">
                Status awal: <b>Tidak Aktif</b> (hanya Ketua RW/Admin yang bisa
                mengaktifkan)
              </div>
              {error && <div className="text-red-600">{error}</div>}
              {success && <div className="text-green-600">{success}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                {loading ? "Memproses..." : "Tambah Lowongan"}
              </button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
