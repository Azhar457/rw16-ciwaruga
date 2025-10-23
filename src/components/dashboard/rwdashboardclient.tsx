"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaUsers, FaSearch, FaSignOutAlt, FaBuilding } from 'react-icons/fa';
import Button from '@/components/ui/Button';

// Definisikan tipe data yang akan diterima sebagai props
interface SessionUser {
  nama_lengkap: string;
  rw_akses: string;
}

interface WargaData {
  id: number;
  nama: string;
  alamat: string;
  rt: string;
  rw: string;
  no_hp: string;
}

interface RwDashboardClientProps {
  initialWarga: WargaData[];
  session: SessionUser;
}

export default function RwDashboardClient({ initialWarga, session }: RwDashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRt, setActiveRt] = useState<string>('Semua');
  const router = useRouter();

  const rukunTetangga = useMemo(() => 
    [...new Set(initialWarga.map(w => w.rt))].sort((a, b) => Number(a) - Number(b)), 
    [initialWarga]
  );

  async function handleLogout() {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/auth/login');
  }

  const displayedWarga = useMemo(() => 
    initialWarga.filter(warga => {
      // --- PERBAIKAN DI SINI ---
      // Pastikan perbandingan dilakukan sebagai string
      const inActiveRt = activeRt === 'Semua' || String(warga.rt) === String(activeRt);
      const matchesSearch = searchTerm === '' || warga.nama.toLowerCase().includes(searchTerm.toLowerCase());
      return inActiveRt && matchesSearch;
    }),
    [initialWarga, activeRt, searchTerm]
  );

  return (
    <main className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Dashboard */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-lg p-6 mb-6 shadow-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Ketua RW {session.rw_akses}</h1>
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
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full"><FaUsers size={24} /></div>
            <div className="ml-4">
              <p className="text-gray-500">Total Warga di RW</p>
              <p className="text-2xl font-bold text-gray-800">{initialWarga.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <div className="bg-green-100 text-green-600 p-4 rounded-full"><FaBuilding size={24} /></div>
            <div className="ml-4">
              <p className="text-gray-500">Jumlah RT</p>
              <p className="text-2xl font-bold text-gray-800">{rukunTetangga.length}</p>
            </div>
          </div>
        </div>

        {/* Area Manajemen Warga */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Warga RW {session.rw_akses}</h2>
          
          <div className="flex border-b mb-4 overflow-x-auto">
            <button 
              onClick={() => setActiveRt('Semua')} 
              className={`px-4 py-2 -mb-px border-b-2 font-medium whitespace-nowrap text-sm sm:text-base ${activeRt === 'Semua' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Semua RT
            </button>
            {rukunTetangga.map(rt => (
              <button 
                key={rt} 
                onClick={() => setActiveRt(String(rt))}
                className={`px-4 py-2 -mb-px border-b-2 font-medium whitespace-nowrap text-sm sm:text-base ${String(activeRt) === String(rt) ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                RT {rt}
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama warga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                  {activeRt === 'Semua' && (
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RT</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. HP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedWarga.length > 0 ? (
                  displayedWarga.map((warga) => (
                    <tr key={warga.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{warga.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.alamat}</td>
                      {activeRt === 'Semua' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.rt}</td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.no_hp}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeRt === 'Semua' ? 4 : 3} className="text-center py-8 text-gray-500">
                      {initialWarga.length > 0 ? "Tidak ada warga yang cocok dengan pencarian." : "Tidak ada data warga di RW ini."}
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