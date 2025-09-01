"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUsers, FaSearch, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/loadingSpinner';
import Button from '@/components/ui/Button';

// Definisikan tipe data untuk user sesi dan warga
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
  nama: string;
  alamat: string;
  rt: string;
  rw: string;
  status_perkawinan: string;
  pekerjaan: string;
  no_hp: string;
}

export default function RTDashboard() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [wargaList, setWargaList] = useState<WargaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      // 1. Periksa sesi pengguna
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) {
        router.push('/auth/login');
        return;
      }
      const sessionData = await sessionRes.json();
      if (!sessionData.success || !sessionData.user || sessionData.user.role !== 'ketua_rt') {
        router.push('/auth/login');
        return;
      }
      setSession(sessionData.user);

      // 2. Ambil data semua warga
      const wargaRes = await fetch('/api/warga');
      if (!wargaRes.ok) {
        console.error("Gagal mengambil data warga");
        setLoading(false);
        return;
      }
      const allWarga = await wargaRes.json();

      // 3. Filter data warga sesuai RT yang diakses oleh Ketua RT
      const filteredWarga = allWarga.filter(
        (warga: WargaData) => warga.rt === sessionData.user.rt_akses && warga.rw === sessionData.user.rw_akses
      );
      
      setWargaList(filteredWarga);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/auth/login');
  }

  const displayedWarga = wargaList.filter(warga =>
    warga.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warga.alamat.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Header Dashboard */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg p-6 mb-6 shadow-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Ketua RT {session.rt_akses} / RW {session.rw_akses}</h1>
              <p className="text-emerald-100">Selamat datang, {session.nama_lengkap}!</p>
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
              <p className="text-2xl font-bold text-gray-800">{wargaList.length}</p>
            </div>
          </div>
          {/* Anda bisa menambahkan kartu statistik lainnya di sini */}
        </div>

        {/* Area Manajemen Warga */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Data Warga RT {session.rt_akses}</h2>
            <div className="w-full sm:w-auto flex gap-2">
              <div className="relative flex-grow">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Button variant="primary" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <FaUserPlus className="mr-2" /> Tambah Warga
              </Button>
            </div>
          </div>

          {/* Tabel Data Warga */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pekerjaan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. HP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedWarga.length > 0 ? (
                  displayedWarga.map((warga) => (
                    <tr key={warga.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{warga.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.alamat}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.status_perkawinan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.pekerjaan}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.no_hp}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      {searchTerm ? "Warga tidak ditemukan." : "Tidak ada data warga."}
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