"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaSearch,
  FaPlus,
  FaSignOutAlt,
  FaTrash,
  FaSync,
  FaEdit,
} from "react-icons/fa";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
interface SessionUser {
  id: number;
  email: string;
  role: string;
  nama_lengkap: string;
  rt_akses: string;
  rw_akses: string;
}

interface WargaData {
  id: number;
  nik_encrypted?: string;
  kk_encrypted?: string;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
  no_hp: string;
  status_aktif: string;
  created_at?: string;
  updated_at?: string;
  last_verified?: string;
}

interface WargaFormData {
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
  no_hp: string;
  status_aktif: string;
}

export default function RTDashboard() {
  // -----------------------------------------------------------------
  // Helper functions
  // -----------------------------------------------------------------
  function formatPhoneNumber(phone: string | undefined | null): string {
    // Handle undefined/null case
    if (!phone) return "";

    // Ensure phone is string
    const phoneStr = String(phone);

    // Remove all non-numeric characters
    let cleaned = phoneStr.replace(/\D/g, "");

    // Handle 62/+62 prefix
    if (cleaned.startsWith("62")) {
      cleaned = "0" + cleaned.substring(2);
    }

    // Handle if number doesn't start with 0
    if (!cleaned.startsWith("0")) {
      cleaned = "0" + cleaned;
    }

    // Validate length (Indonesian numbers are 10-13 digits)
    if (cleaned.length < 10 || cleaned.length > 13) {
      return phoneStr; // Return original if invalid
    }

    return cleaned;
  }

  function formatDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    // Format as DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

   // FUNGSI BARU untuk mem-parse tanggal DD/MM/YYYY
  const parseDateString = (dateStr: string): string => {
    if (!dateStr || typeof dateStr !== 'string') return "";
    // Cek jika sudah dalam format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    // Cek jika format DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Pastikan semua bagian valid sebelum digabungkan
      if (day && month && year && year.length === 4) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    // Jika format lain atau tidak valid, coba parse langsung (fallback)
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
    }
    return ""; // Kembalikan string kosong jika tidak valid
  };

   // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [wargaList, setWargaList] = useState<WargaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState<WargaData | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState<WargaFormData>({
    nama: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    alamat: "",
    rt: "",
    rw: "16",
    kelurahan: "Ciwaruga",
    kecamatan: "Bandung",
    agama: "",
    status_perkawinan: "",
    pekerjaan: "",
    kewarganegaraan: "Indonesia",
    no_hp: "",
    status_aktif: "Aktif",
  });

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const wargaRes = await fetch(`/api/warga`);
      if (!wargaRes.ok) throw new Error("Gagal mengambil data warga");
      const response = await wargaRes.json();
      if (response.success && Array.isArray(response.data)) {
        setWargaList(response.data);
      } else {
        throw new Error("Format data tidak sesuai");
      }
    } catch (error) {
      console.error("Error fetching warga data:", error);
      setWargaList([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenModal = (warga: WargaData | null = null) => {
    if (warga) {
      setEditingWarga(warga);
      // GUNAKAN FUNGSI BARU DI SINI
      const formattedDate = parseDateString(warga.tanggal_lahir);
      setFormData({ ...warga, tanggal_lahir: formattedDate });
    } else {
      setEditingWarga(null);
      setFormData({
        nama: "",
        jenis_kelamin: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        alamat: "",
        rt: session?.rt_akses || "",
        rw: session?.rw_akses || "",
        kelurahan: "Ciwaruga",
        kecamatan: "Bandung",
        agama: "",
        status_perkawinan: "",
        pekerjaan: "",
        kewarganegaraan: "Indonesia",
        no_hp: "",
        status_aktif: "Aktif",
      });
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWarga(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    // Saat mengirim, ubah kembali format tanggal ke DD/MM/YYYY jika diperlukan oleh backend
    const [year, month, day] = formData.tanggal_lahir.split('-');
    const submissionData = {
      ...formData,
      tanggal_lahir: `${day}/${month}/${year}`,
    };
  
    const url = editingWarga ? `/api/warga?id=${editingWarga.id}` : "/api/warga";
    const method = editingWarga ? "PUT" : "POST";
  
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData), // Kirim data dengan format tanggal yang benar
      });
  
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          handleCloseModal();
          await fetchData();
          alert(`Data warga berhasil ${editingWarga ? 'diperbarui' : 'ditambahkan'}`);
        } else {
          alert(result.message || "Gagal menyimpan data");
        }
      } else {
        throw new Error("Gagal menyimpan data warga");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------------------------------------------
  // Delete warga
  // -----------------------------------------------------------------
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/warga", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          await fetchData();
          alert("Data warga berhasil dihapus");
        } else {
          alert(result.message || "Gagal menghapus data warga");
        }
      } else {
        alert("Gagal menghapus data warga");
      }
    } catch (error) {
      console.error("Error deleting warga:", error);
      alert("Terjadi kesalahan saat menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  // -----------------------------------------------------------------
  // Inisialisasi session
  // -----------------------------------------------------------------
  useEffect(() => {
    async function initData() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok) {
          router.push("/auth/login");
          return;
        }
        const sessionData = await sessionRes.json();
        if (
          !sessionData.success ||
          !sessionData.user ||
          sessionData.user.role !== "ketua_rt"
        ) {
          router.push("/auth/login");
          return;
        }
        setSession(sessionData.user);

        await fetchData();
        setLoading(false);
      } catch (error) {
        console.error("Error in initData:", error);
        setLoading(false);
      }
    }
    initData();
  }, [router]);

  // -----------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------
  async function handleLogout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/auth/login");
  }

  // -----------------------------------------------------------------
  // Filter & render
  // -----------------------------------------------------------------
  // Filter & render
  const displayedWarga = wargaList.filter(
    (warga) =>
      warga.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warga.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warga.pekerjaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warga.no_hp.includes(searchTerm)
  );
  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Dashboard */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg p-6 mb-6 shadow-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Dashboard Ketua RT {session.rt_akses} / RW {session.rw_akses}
              </h1>
              <p className="text-emerald-100">
                Selamat datang, {session.nama_lengkap}!
              </p>
            </div>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <FaSignOutAlt className="mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
              <FaUsers size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500">Total Warga</p>
              <p className="text-2xl font-bold text-gray-800">
                {wargaList.length}
              </p>
            </div>
          </div>
        </div>

        {/* Area Manajemen Warga */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Data Warga RT {session.rt_akses}
            </h2>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => handleOpenModal()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <FaPlus className="mr-2" /> Tambah Warga
              </Button>
              <Button
                onClick={() => fetchData()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <FaSync className="mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, alamat, atau pekerjaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tabel Data Warga */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alamat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pekerjaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No. HP
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedWarga.length > 0 ? (
                  displayedWarga.map((warga) => (
                    <tr key={warga.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {warga.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {warga.alamat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {warga.status_perkawinan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {warga.pekerjaan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {warga.no_hp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-4">
                        <button
                          onClick={() => handleOpenModal(warga)}
                          className="text-blue-600 hover:text-blue-900"
                          disabled={isSubmitting}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(warga.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "Warga tidak ditemukan"
                        : "Tidak ada data warga"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal untuk Tambah/Edit Warga */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWarga ? "Edit Data Warga" : "Tambah Data Warga"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {/* Jenis Kelamin */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Jenis Kelamin
              </label>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            {/* Tempat Lahir */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                name="tempat_lahir"
                value={formData.tempat_lahir}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {/* Tanggal Lahir */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="tanggal_lahir"
                value={formData.tanggal_lahir}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {/* Alamat */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Alamat</label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {/* RT/RW, Kelurahan, Kecamatan (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-1">RT/RW</label>
              <input
                type="text"
                value={`${session.rt_akses}/${session.rw_akses}`}
                className="w-full p-2 border rounded bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Kelurahan
              </label>
              <input
                type="text"
                value="Ciwaruga"
                className="w-full p-2 border rounded bg-gray-100"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value="Bandung"
                className="w-full p-2 border rounded bg-gray-100"
                readOnly
              />
            </div>
            {/* Agama */}
            <div>
              <label className="block text-sm font-medium mb-1">Agama</label>
              <select
                name="agama"
                value={formData.agama}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
            {/* Status Perkawinan */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Status Perkawinan
              </label>
              <select
                name="status_perkawinan"
                value={formData.status_perkawinan}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Pilih Status</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
              </select>
            </div>
            {/* Pekerjaan */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Pekerjaan
              </label>
              <input
                type="text"
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {/* Kewarganegaraan */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Kewarganegaraan
              </label>
              <input
                type="text"
                name="kewarganegaraan"
                value={formData.kewarganegaraan}
                onChange={handleFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {/* No. HP */}
            <div>
              <label className="block text-sm font-medium mb-1">No. HP</label>
              <input
                type="tel"
                name="no_hp"
                value={formData.no_hp}
                onChange={handleFormChange}
                pattern="[0-9]*"
                maxLength={13}
                placeholder="Contoh: 08123456789"
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-emerald-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}