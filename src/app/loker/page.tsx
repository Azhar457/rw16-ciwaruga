"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Modal from "@/components/ui/Modal";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";

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

export default function LokerPage() {
  const [lokerList, setLokerList] = useState<LokerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoker, setSelectedLoker] = useState<LokerData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");

  useEffect(() => {
    async function fetchLoker() {
      try {
        const response = await fetch("/api/loker");
        const result = await response.json();
        if (Array.isArray(result)) {
          setLokerList(result);
        }
      } catch (error) {
        console.error("Error fetching loker:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLoker();
  }, []);

  const jenisOptions = [
    ...new Set(lokerList.map((loker) => loker.contact_method)),
  ];

  const filteredLoker = lokerList.filter((loker) => {
    const matchesSearch =
      loker.posisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loker.perusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loker.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJenis =
      selectedJenis === "" || loker.contact_method === selectedJenis;
    return matchesSearch && matchesJenis;
  });

  const formatRupiah = (salary: string) => salary || "-";

  const isExpired = (batasLamaran: string) => {
    return new Date(batasLamaran) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
<>
    <Navbar />
    <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-200 relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          Lowongan Kerja RW 16 Ciwaruga
          </h3>
          <p className="text-xl text-emerald-100 mb-8">
            Temukan peluang karir terbaik di sekitar lingkungan kita. Berbagai
            posisi dari perusahaan dan UMKM terpercaya.
          </p>
        </div>
      </section>

      {/* Gelombang Transition */}
      <svg
        className="relative block w-full h-24 -mt-16"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1200 120"
      >
        <path
          d="M321.39 56.44c58.58-10.79 114.15-30.14 
            172.32-41.86 82.39-16.63 168.19-17.75 
            250.45-.39 110.38 23.41 221.77 71.48 
            332.15 66.6 58.49-2.6 113.06-22.64 
            170.64-39.05V120H0V16.48
            c92.89 27.18 191.73 55.75 321.39 39.96z"
          fill="#ffffffff"
        />
      </svg>
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari lowongan, perusahaan, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-64">
              <select
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Jenis Pekerjaan</option>
                {jenisOptions.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-gray-600">
            Menampilkan {filteredLoker.length} dari {lokerList.length} lowongan
            aktif
          </div>
        </div>

        {/* Loker Grid */}
        {filteredLoker.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {searchTerm || selectedJenis
                ? "Tidak ada lowongan yang sesuai dengan pencarian"
                : "Belum ada lowongan tersedia"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoker.map((loker) => (
              <Card
                key={loker.id}
                className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  isExpired(loker.deadline) ? "opacity-60" : ""
                }`}
                onClick={() => setSelectedLoker(loker)}
              >
                <CardContent>
                  {loker.gambar_url && (
                    <div className="mb-3">
                      <Image
                        src={loker.gambar_url}
                        alt={loker.posisi}
                        width={400}
                        height={160}
                        className="rounded-lg object-cover w-full h-40"
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {loker.contact_method}
                      </span>
                      {isExpired(loker.deadline) && (
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {loker.posisi}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <span className="w-4 h-4 mr-2">🏢</span>
                      <span className="font-medium">{loker.perusahaan}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-4 h-4 mr-2">📍</span>
                      <span>{loker.lokasi}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-4 h-4 mr-2">💰</span>
                      <span>{formatRupiah(loker.salary_range)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <div>
                      Batas:{" "}
                      {new Date(loker.deadline).toLocaleDateString("id-ID")}
                    </div>
                    <div>Pendidikan: {loker.requirements}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Detail */}
        {selectedLoker && (
          <Modal
            isOpen={!!selectedLoker}
            onClose={() => setSelectedLoker(null)}
            title={selectedLoker.posisi}
            size="lg"
          >
            <div className="space-y-6">
              {selectedLoker.gambar_url && (
                <Image
                  src={selectedLoker.gambar_url}
                  alt={selectedLoker.posisi}
                  width={600}
                  height={240}
                  className="rounded-lg object-cover w-full h-60 mb-4"
                />
              )}
              <div className="flex gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {selectedLoker.contact_method}
                </span>
                {isExpired(selectedLoker.deadline) && (
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                    Expired
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Perusahaan
                  </h4>
                  <p className="text-gray-700">{selectedLoker.perusahaan}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Lokasi</h4>
                  <p className="text-gray-700">{selectedLoker.lokasi}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gaji</h4>
                  <p className="text-gray-700">
                    {formatRupiah(selectedLoker.salary_range)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Pendidikan
                  </h4>
                  <p className="text-gray-700">{selectedLoker.requirements}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Batas Lamaran
                  </h4>
                  <p className="text-gray-700">
                    {new Date(selectedLoker.deadline).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Deskripsi Pekerjaan
                </h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedLoker.deskripsi}
                </p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
}
