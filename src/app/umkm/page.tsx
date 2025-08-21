"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import Image from "next/image";

interface UmkmData {
  id: string;
  nama_usaha: string;
  pemilik_nik_encrypted: string;
  jenis_usaha: string;
  alamat: string;
  no_hp: string;
  deskripsi: string;
  foto_url: string;
  status_verifikasi: string;
  admin_approver: string;
  created_at: string;
  updated_at: string;
  linked_warga_id?: string;
}

export default function UMKMPage() {
  const [umkmList, setUmkmList] = useState<UmkmData[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function fetchUMKM() {
      setLoading(true);
      const res = await fetch("/api/umkm");
      const result = await res.json();
      const verified = Array.isArray(result.data)
        ? result.data.filter(
            (umkm: { status_verifikasi: string }) =>
              umkm.status_verifikasi === "Verified"
          )
        : [];
      setUmkmList(verified);
      setLoading(false);
    }
    fetchUMKM();
  }, []);

  // hitung index pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = umkmList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(umkmList.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <Navbar />

      {/* HEADER */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-200 relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Usaha Mikro, Kecil, dan Menengah <br /> Desa Ciwaruga
          </h3>
          <p className="text-xl text-emerald-100 mb-8">
            Daftar UMKM yang sudah terverifikasi di Desa Ciwaruga
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

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-emerald-600 rounded-full"></div>
            </div>
          ) : (
            <>
              {/* daftar UMKM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {currentItems.map((umkm) => (
                  <div
                    key={umkm.id}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden p-4"
                  >
                    {umkm.foto_url && (
                      <Image
                        src={umkm.foto_url}
                        alt={umkm.nama_usaha}
                        width={400}
                        height={200}
                        className="w-full h-40 object-cover rounded"
                      />
                    )}
                    <h2 className="mt-3 font-semibold text-lg">
                      {umkm.nama_usaha}
                    </h2>
                    <div className="text-sm text-gray-700">
                      {umkm.jenis_usaha}
                    </div>
                    <p className="mt-2 text-sm">{umkm.deskripsi}</p>
                    <p className="mt-2 text-xs text-gray-500">{umkm.alamat}</p>
                    <p className="mt-2 text-xs">Kontak: {umkm.no_hp}</p>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10 space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded ${
                          page === currentPage
                            ? "bg-emerald-700 text-white"
                            : "bg-emerald-200 text-emerald-800 hover:bg-emerald-300"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
  