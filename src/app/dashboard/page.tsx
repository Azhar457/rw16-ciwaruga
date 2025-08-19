"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/loadingSpinner";

interface DashboardStats {
  totalWarga: number;
  totalUmkm: number;
  totalLoker: number;
  totalBerita: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWarga: 0,
    totalUmkm: 0,
    totalLoker: 0,
    totalBerita: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch data dari berbagai endpoints
        const [wargaRes, umkmRes, lokerRes, beritaRes] = await Promise.all([
          fetch("/api/warga"),
          fetch("/api/umkm"),
          fetch("/api/loker"),
          fetch("/api/berita"),
        ]);

        const [wargaData, umkmData, lokerData, beritaData] = await Promise.all([
          wargaRes.json(),
          umkmRes.json(),
          lokerRes.json(),
          beritaRes.json(),
        ]);

        setStats({
          totalWarga: Array.isArray(wargaData) ? wargaData.length : 0,
          totalUmkm: Array.isArray(umkmData.data) ? umkmData.data.length : 0,
          totalLoker: Array.isArray(lokerData) ? lokerData.length : 0,
          totalBerita: Array.isArray(beritaData) ? beritaData.length : 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard RW 16 Ciwaruga
        </h1>
        <p className="text-gray-600 mt-2">
          Selamat datang di portal informasi warga
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card hover>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalWarga}
            </div>
            <div className="text-gray-600">Total Warga</div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalUmkm}
            </div>
            <div className="text-gray-600">UMKM Terdaftar</div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.totalLoker}
            </div>
            <div className="text-gray-600">Lowongan Kerja</div>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {stats.totalBerita}
            </div>
            <div className="text-gray-600">Berita Terbaru</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Akses Cepat</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="/umkm"
                className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-blue-900">Lihat UMKM</div>
                <div className="text-sm text-blue-700">
                  Daftar usaha mikro di RW 16
                </div>
              </a>
              <a
                href="/loker"
                className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-green-900">Lowongan Kerja</div>
                <div className="text-sm text-green-700">
                  Cari pekerjaan di sekitar
                </div>
              </a>
              <a
                href="/berita"
                className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-purple-900">
                  Berita Terkini
                </div>
                <div className="text-sm text-purple-700">
                  Informasi terbaru RW 16
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Pengumuman</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="font-medium text-yellow-900">
                  Rapat RT Bulanan
                </div>
                <div className="text-sm text-yellow-700">
                  Setiap tanggal 15, di Balai RW
                </div>
              </div>
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="font-medium text-blue-900">
                  Pendaftaran UMKM
                </div>
                <div className="text-sm text-blue-700">
                  Daftar gratis untuk promosi usaha
                </div>
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                <div className="font-medium text-green-900">Program Bansos</div>
                <div className="text-sm text-green-700">
                  Info bantuan sosial terbaru
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
