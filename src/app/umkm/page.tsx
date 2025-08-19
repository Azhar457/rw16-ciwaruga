"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

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
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUMKM() {
      const res = await fetch("/api/umkm");
      const result = await res.json();
      // Pastikan hanya yang status_verifikasi === "Verified" yang ditampilkan
      const verified = Array.isArray(result.data)
        ? result.data.filter(
            (umkm: { status_verifikasi: string }) =>
              umkm.status_verifikasi === "Verified"
          )
        : [];
      setUmkmList(verified);
    }
    fetchUMKM();
  }, []);

  // if (loading) {
  //   return <div className="text-center py-8">Loading...</div>;
  // }

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">UMKM RW</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {umkmList.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500">
              Belum ada data UMKM terverifikasi.
            </div>
          ) : (
            umkmList.map((umkm) => (
              <Card key={umkm.id || umkm.nama_usaha}>
                <h2 className="font-semibold text-lg">{umkm.nama_usaha}</h2>
                <div className="text-sm text-gray-700">{umkm.jenis_usaha}</div>
                <div className="mt-2">{umkm.deskripsi}</div>
                <div className="mt-2 text-xs text-gray-500">{umkm.alamat}</div>
                <div className="mt-2 text-xs">Kontak: {umkm.no_hp}</div>
                <div className="mt-2 text-xs text-gray-400">
                  Status: {umkm.status_verifikasi}
                </div>
                {umkm.foto_url && (
                  <Image
                    src={umkm.foto_url}
                    alt={umkm.nama_usaha}
                    width={400}
                    height={160}
                    className="mt-2 w-full h-40 object-cover rounded"
                  />
                )}
              </Card>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
