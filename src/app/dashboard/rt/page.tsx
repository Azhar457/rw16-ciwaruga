"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaSearch,
  FaUserPlus,
  FaPlus,
  FaSignOutAlt,
  FaTrash,
  FaSync,
} from "react-icons/fa";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Button from "@/components/ui/Button";

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

  // -----------------------------------------------------------------
  // State
  // -----------------------------------------------------------------
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [wargaList, setWargaList] = useState<WargaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
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

  // -----------------------------------------------------------------
  // Fetch data
  // -----------------------------------------------------------------
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const wargaRes = await fetch("/api/warga");
      if (!wargaRes.ok) {
        console.error("Gagal mengambil data warga");
        return;
      }
      const response = await wargaRes.json();

      if (response.success && Array.isArray(response.data)) {
        // Pastikan perbandingan dengan mengkonversi ke string
        const formattedData = response.data
          .filter(
            (warga: WargaData) =>
              String(warga.rt) === String(session?.rt_akses) &&
              String(warga.rw) === String(session?.rw_akses) &&
              warga.status_aktif === "Aktif"
          )
          .map((warga: WargaData) => ({
            ...warga,
            // Convert numbers to strings for display
            rt: String(warga.rt),
            rw: String(warga.rw),
            no_hp: formatPhoneNumber(String(warga.no_hp)),
            created_at: formatDate(warga.created_at?.toString() || ""),
            updated_at: formatDate(warga.updated_at?.toString() || ""),
          }));
        setWargaList(formattedData);
      } else {
        console.error("Format data tidak sesuai:", response);
        setWargaList([]);
      }
    } catch (error) {
      console.error("Error fetching warga data:", error);
      setWargaList([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // -----------------------------------------------------------------
  // Add warga
  // -----------------------------------------------------------------
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const wargaToAdd = {
        ...formData,
        no_hp: formatPhoneNumber(formData.no_hp),
        rt: String(session?.rt_akses), // Ensure string type
        rw: String(session?.rw_akses), // Ensure string type
        kelurahan: "Ciwaruga",
        kecamatan: "Bandung",
        status_aktif: "Aktif",
      };

      console.log("Adding warga:", wargaToAdd); // Debug log

      const res = await fetch("/api/warga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wargaToAdd),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setShowAddModal(false);
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
          await fetchData(); // Refresh data
          alert("Data warga berhasil ditambahkan");
        } else {
          alert(result.message || "Gagal menambah data warga");
        }
      }
    } catch (error) {
      console.error("Error adding warga:", error);
      alert("Terjadi kesalahan saat menambah data warga");
    } finally {
      setIsAdding(false);
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

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
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
          {/* Header dengan Refresh & Search pertama */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Data Warga RT {session.rt_akses}
            </h2>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={isAdding}
              >
                {isAdding ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <FaPlus className="mr-2" />
                )}
                Tambah Warga
              </Button>

              <Button
                onClick={fetchData}
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

          {/* Search Bar */}
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

          {/* Modal Tambah Warga */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-lg font-bold mb-4">Tambah Data Warga</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Nama */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
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
                        value={formData.jenis_kelamin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            jenis_kelamin: e.target.value,
                          })
                        }
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
                        value={formData.tempat_lahir}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tempat_lahir: e.target.value,
                          })
                        }
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
                        value={formData.tanggal_lahir}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tanggal_lahir: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    {/* Alamat */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Alamat
                      </label>
                      <input
                        type="text"
                        value={formData.alamat}
                        onChange={(e) =>
                          setFormData({ ...formData, alamat: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    {/* RT / RW (read‑only) */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        RT/RW
                      </label>
                      <input
                        type="text"
                        value={`${session.rt_akses}/${session.rw_akses}`}
                        className="w-full p-2 border rounded bg-gray-100"
                        readOnly
                      />
                    </div>

                    {/* Kelurahan (read‑only) */}
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

                    {/* Kecamatan (read‑only) */}
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
                      <label className="block text-sm font-medium mb-1">
                        Agama
                      </label>
                      <select
                        value={formData.agama}
                        onChange={(e) =>
                          setFormData({ ...formData, agama: e.target.value })
                        }
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
                        value={formData.status_perkawinan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status_perkawinan: e.target.value,
                          })
                        }
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
                        value={formData.pekerjaan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pekerjaan: e.target.value,
                          })
                        }
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
                        value={formData.kewarganegaraan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kewarganegaraan: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    {/* No. HP */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        No. HP
                      </label>
                      <input
                        type="tel"
                        value={formData.no_hp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 13) {
                            setFormData({ ...formData, no_hp: value });
                          }
                        }}
                        pattern="[0-9]*"
                        maxLength={13}
                        placeholder="Contoh: 08123456789"
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                  </div>

                  {/* Tombol aksi di dalam modal */}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddModal(false)}
                      disabled={isAdding}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="bg-emerald-500"
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                      className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
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
    </main>
  );
}
