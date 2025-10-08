"use client";
import { useEffect, useState, useRef } from "react";
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
import { useToast } from "@/components/ui/ToastProvider";

// ... (Interface tetap sama)
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
  [key: string]: any; // Menambahkan index signature
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
  const { addToast } = useToast(); // 2. Panggil hook di dalam komponen
  const router = useRouter();

  function formatPhoneNumber(phone: string | undefined | null): string {
    if (!phone) return "";
    const phoneStr = String(phone);
    let cleaned = phoneStr.replace(/\D/g, "");
    if (cleaned.startsWith("62")) {
      cleaned = "0" + cleaned.substring(2);
    }
    if (!cleaned.startsWith("0")) {
      cleaned = "0" + cleaned;
    }
    if (cleaned.length < 10 || cleaned.length > 13) {
      return phoneStr;
    }
    return cleaned;
  }

  const parseDateString = (dateStr: string): string => {
    if (!dateStr || typeof dateStr !== "string") return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year && year.length === 4) {
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
    return "";
  };
  // 2. Buat ref untuk checkbox "select all"
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [wargaList, setWargaList] = useState<WargaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState<WargaData | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
      } catch (error) {
        console.error("Error in initData:", error);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [router]);

  // 3. Gunakan useEffect untuk mengatur indeterminate
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const isIndeterminate =
        selectedIds.length > 0 && selectedIds.length < wargaList.length;
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedIds, wargaList.length]);

  const handleOpenModal = (warga: WargaData | null = null) => {
    if (warga) {
      setEditingWarga(warga);
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

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const [year, month, day] = formData.tanggal_lahir.split("-");
    const submissionData = {
      ...formData,
      tanggal_lahir: `${day}/${month}/${year}`,
    };

    const url = editingWarga
      ? `/api/warga?id=${editingWarga.id}`
      : "/api/warga";
    const method = editingWarga ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        handleCloseModal();
        await fetchData();
        addToast(
          `Data warga berhasil ${editingWarga ? "diperbarui" : "ditambahkan"}`,
          "success"
        );
      } else {
        throw new Error(result.message || "Gagal menyimpan data");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      addToast(`Terjadi kesalahan: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus ${selectedIds.length} data yang dipilih?`
      )
    )
      return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/warga", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        addToast(result.message || "Proses selesai");
        setSelectedIds([]);
        await fetchData();
      } else {
        throw new Error(result.message || "Gagal menghapus data");
      }
    } catch (error: any) {
      console.error("Error deleting selected warga:", error);
      addToast(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(displayedWarga.map((w) => w.id));
    } else {
      setSelectedIds([]);
    }
  };

  async function handleLogout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/auth/login");
  }

  const displayedWarga = wargaList.filter(
    (warga) =>
      warga.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warga.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warga.pekerjaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(warga.no_hp).includes(searchTerm)
  );

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
              <FaUsers size={24} />
            </div>
            <div className="ml-4">
              <p className="text-gray-500">Total Warga Aktif</p>
              <p className="text-2xl font-bold text-gray-800">
                {wargaList.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Data Warga RT {session.rt_akses}
            </h2>
            <div className="flex items-center gap-4">
              {selectedIds.length > 0 && (
                <Button
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <FaTrash className="mr-2" />
                  )}
                  Hapus ({selectedIds.length})
                </Button>
              )}
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      onChange={handleSelectAll}
                      checked={
                        displayedWarga.length > 0 &&
                        selectedIds.length === displayedWarga.length
                      }
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < displayedWarga.length
                      }
                    />
                  </th>
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
                {displayedWarga.map((warga) => (
                  <tr
                    key={warga.id}
                    className={`hover:bg-gray-50 ${
                      selectedIds.includes(warga.id) ? "bg-emerald-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        checked={selectedIds.includes(warga.id)}
                        onChange={() => handleSelect(warga.id)}
                      />
                    </td>
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
                      {formatPhoneNumber(warga.no_hp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(warga)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={isSubmitting}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
                {displayedWarga.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWarga ? "Edit Data Warga" : "Tambah Data Warga"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
