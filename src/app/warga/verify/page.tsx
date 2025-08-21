
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import Navbar from "../../../components/ui/Navbar";
import Footer from "../../../components/ui/Footer";
import Image from "next/image";

interface WargaData {
  id: number;
  nik_encrypted: string;
  kk_encrypted: string;
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
  created_at: string;
  updated_at: string;
}

export default function WargaVerifyPage() {
  const [nik, setNik] = useState("");
  const [kk, setKk] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wargaData, setWargaData] = useState<WargaData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setWargaData(null);

    try {
      const response = await fetch("/api/warga/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nik, kk }),
      });

      const result = await response.json();

      if (result.success) {
        setWargaData(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-200 relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Verifikasi Data Warga
          </h3>
          <p className="text-xl text-emerald-100 mb-8">
            Masukkan NIK dan Nomor KK Anda untuk melihat data pribadi. Data Anda
            aman dan tidak akan disimpan.
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

      <div className="min-h-screen bg-white py-12">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          {!wargaData ? (
           <Card className="shadow-xl rounded-3xl border border-emerald-200 bg-gradient-to-b from-white to-emerald-100 p-6">
       <CardHeader className="text-center">
  <h2 className="text-2xl font-bold text-emerald-500">
     Form Verifikasi Data Warga
  </h2>
  <p className="text-sm text-gray-500 mt-1">
    Masukkan NIK & Nomor KK untuk melihat data Anda
  </p>
</CardHeader>
<br />
  <div className="flex flex-col md:flex-row gap-6">
    
    {/* Gambar kiri */}
    <div className="flex-[1] flex justify-center md:justify-start">
      <Image
        src="/ciwa2.jpg"
        alt="Ilustrasi Verifikasi Warga"
        width={600}
        height={400}
        className="object-contain"
      />
    </div>

    {/* Form kanan */}
    <div className="flex-[2]">
      

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm shadow-sm">
              ❌ {error}
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Induk Kependudukan (NIK)
            </label>
            <span className="absolute left-3 top-9 text-gray-400">👤</span>
            <input
              type="text"
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              required
              maxLength={16}
              placeholder="Masukkan 16 digit NIK"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nomor Kartu Keluarga (KK)
            </label>
            <span className="absolute left-3 top-9 text-gray-400">🏠</span>
            <input
              type="text"
              value={kk}
              onChange={(e) => setKk(e.target.value)}
              required
              maxLength={16}
              placeholder="Masukkan 16 digit Nomor KK"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>

         <Button
  type="submit"
  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transform transition hover:scale-105"
  loading={loading}
  disabled={loading}
>
  {loading ? <LoadingSpinner size="sm" /> : "Verifikasi Data"}
</Button>

        </form>

        <div className="mt-6 text-sm text-gray-500 text-center md:text-left">
          🔒 Data Anda aman dan tidak akan disimpan di sistem kami
        </div>
      </CardContent>
    </div>
  </div>
</Card>

          ) : (
           <Card>
//             <CardHeader className="bg-green-50">
//               <h2 className="text-xl font-semibold text-green-800 text-center">
//                 ✅ Data Berhasil Ditemukan
//               </h2>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-3">
//                     Data Pribadi
//                   </h3>
//                   <div className="space-y-2">
//                     <div>
//                       <span className="text-gray-600">NIK:</span>
//                       <span className="ml-2 font-medium">
//                         {wargaData.nik_encrypted}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">No. KK:</span>
//                       <span className="ml-2 font-medium">
//                         {wargaData.kk_encrypted}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Nama:</span>
//                       <span className="ml-2 font-medium">{wargaData.nama}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Jenis Kelamin:</span>
//                       <span className="ml-2">{wargaData.jenis_kelamin}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Tempat Lahir:</span>
//                       <span className="ml-2">{wargaData.tempat_lahir}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Tanggal Lahir:</span>
//                       <span className="ml-2">{wargaData.tanggal_lahir}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Agama:</span>
//                       <span className="ml-2">{wargaData.agama}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-3">
//                     Alamat & Kontak
//                   </h3>
//                   <div className="space-y-2">
//                     <div>
//                       <span className="text-gray-600">Alamat:</span>
//                       <span className="ml-2">{wargaData.alamat}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">RT:</span>
//                       <span className="ml-2">{wargaData.rt}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">RW:</span>
//                       <span className="ml-2">{wargaData.rw}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Kelurahan:</span>
//                       <span className="ml-2">{wargaData.kelurahan}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Kecamatan:</span>
//                       <span className="ml-2">{wargaData.kecamatan}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">No. HP:</span>
//                       <span className="ml-2">{wargaData.no_hp}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Status Perkawinan:</span>
//                       <span className="ml-2">
//                         {wargaData.status_perkawinan}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-gray-600">Pekerjaan:</span>
//                       <span className="ml-2">{wargaData.pekerjaan}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6 text-center">
//                 <Button
                  onClick={() => {
                    setWargaData(null);
                    setNik("");
                    setKk("");
                  }}
                  variant="secondary"
                >
                  Verifikasi Data Lain
                </Button>
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
