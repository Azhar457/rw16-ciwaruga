"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/loadingSpinner";

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verifikasi Data Warga
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Masukkan NIK dan Nomor KK Anda untuk melihat data pribadi. Data Anda
            aman dan tidak akan disimpan.
          </p>
        </div>

        {!wargaData ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <h2 className="text-xl font-semibold text-center">
                Masukkan Data Verifikasi
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="nik"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    NIK
                  </label>
                  <input
                    id="nik"
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    required
                    maxLength={16}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan 16 digit NIK"
                  />
                </div>

                <div>
                  <label
                    htmlFor="kk"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nomor KK
                  </label>
                  <input
                    id="kk"
                    type="text"
                    value={kk}
                    onChange={(e) => setKk(e.target.value)}
                    required
                    maxLength={16}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan 16 digit Nomor KK"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" /> : "Verifikasi Data"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>🔒 Data Anda aman dan tidak akan disimpan di sistem kami</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="bg-green-50">
              <h2 className="text-xl font-semibold text-green-800 text-center">
                ✅ Data Berhasil Ditemukan
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Data Pribadi
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">NIK:</span>
                      <span className="ml-2 font-medium">
                        {wargaData.nik_encrypted}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">No. KK:</span>
                      <span className="ml-2 font-medium">
                        {wargaData.kk_encrypted}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Nama:</span>
                      <span className="ml-2 font-medium">{wargaData.nama}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Jenis Kelamin:</span>
                      <span className="ml-2">{wargaData.jenis_kelamin}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tempat Lahir:</span>
                      <span className="ml-2">{wargaData.tempat_lahir}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tanggal Lahir:</span>
                      <span className="ml-2">{wargaData.tanggal_lahir}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Agama:</span>
                      <span className="ml-2">{wargaData.agama}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Alamat & Kontak
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Alamat:</span>
                      <span className="ml-2">{wargaData.alamat}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">RT:</span>
                      <span className="ml-2">{wargaData.rt}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">RW:</span>
                      <span className="ml-2">{wargaData.rw}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kelurahan:</span>
                      <span className="ml-2">{wargaData.kelurahan}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kecamatan:</span>
                      <span className="ml-2">{wargaData.kecamatan}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">No. HP:</span>
                      <span className="ml-2">{wargaData.no_hp}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status Perkawinan:</span>
                      <span className="ml-2">
                        {wargaData.status_perkawinan}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pekerjaan:</span>
                      <span className="ml-2">{wargaData.pekerjaan}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
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
  );
}
