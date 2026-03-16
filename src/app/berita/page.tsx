"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import LoadingSpinner from "@/components/ui/loadingSpinner";

interface BeritaArtikel {
  id: number;
  kategori: string;
  judul: string;
  konten: string; // deskripsi
  foto_url: string; // image
  penulis: string; // author
  views: number;
  published_at: string; // date
}

export default function BeritaPage() {
  const [beritaData, setBeritaData] = useState<BeritaArtikel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchBeritaData = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/berita?page=${page}&limit=6`);
      const result = await res.json();
      if (result.success) {
        setBeritaData(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch berita", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeritaData(currentPage);
  }, [currentPage]);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Helper to strip HTML tags for description preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Navbar />
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-200 relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Berita Terbaru Desa Ciwaruga
          </h3>
          <p className="text-xl text-emerald-100 mb-8">
            Informasi terbaru seputar Desa Ciwaruga
          </p>
        </div>
      </section>

      {/* Gelombang Transition */}
      <svg
        className="relative block w-full h-16 -mt-15"
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
        {/* Section Header */}

        {/* Grid Berita */}
        <div className="container mx-auto px-6 pb-12 pt-25 pb-25">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
              {beritaData.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="relative w-full h-48">
                    <Image
                      src={item.foto_url || "/bgg.jpg"}
                      alt={item.judul}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                        {item.kategori || "Umum"}
                      </span>
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-emerald-500 mb-2 hover:text-emerald-600 cursor-pointer">
                      {item.judul}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {item.konten ? stripHtml(item.konten) : "Tidak ada konten"}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 border-t pt-3">
                      <span>✍ {item.penulis || "Admin"}</span>
                      <span>👁 {item.views}x</span>
                    </div>
                  </div>
                </div>
              ))}
              {beritaData.length === 0 && (
                <div className="col-span-full text-center text-gray-500">
                  Belum ada berita.
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded ${currentPage === 1
                  ? "bg-gray-200 text-gray-400"
                  : "bg-white border hover:bg-gray-100"
                }`}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => goToPage(num)}
                className={`px-3 py-2 rounded ${currentPage === num
                    ? "bg-emerald-500 text-white"
                    : "bg-white border hover:bg-gray-100"
                  }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded ${currentPage === totalPages
                  ? "bg-gray-200 text-gray-400"
                  : "bg-white border hover:bg-gray-100"
                }`}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

