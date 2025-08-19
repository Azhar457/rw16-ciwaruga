import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  // Quick action items sesuai dengan API endpoints yang sudah kita buat
  const quickActions = [
    {
      title: "Verifikasi Data Warga",
      description: "Cek data pribadi Anda dengan NIK dan No. KK",
      icon: "👤",
      href: "/warga/verify",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Berita Terkini",
      description: "Informasi dan pengumuman terbaru dari RT/RW",
      icon: "📰",
      href: "/berita",
      color: "from-green-500 to-green-600",
    },
    {
      title: "UMKM Lokal",
      description: "Usaha Mikro Kecil Menengah di sekitar RT/RW",
      icon: "🏪",
      href: "/umkm",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Lowongan Kerja",
      description: "Peluang karir di sekitar wilayah RT/RW",
      icon: "💼",
      href: "/loker",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Login Admin",
      description: "Akses dashboard untuk pengurus RT/RW",
      icon: "🔐",
      href: "/auth/login",
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  // Data struktur organisasi (bisa diambil dari API nanti)
  const struktur = [
    { jabatan: "Ketua RW", nama: "[Nama Ketua RW]" },
    { jabatan: "Sekretaris RW", nama: "[Nama Sekretaris]" },
    { jabatan: "Bendahara RW", nama: "[Nama Bendahara]" },
    { jabatan: "Ketua RT", nama: "[Nama Ketua RT]" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section>
        <div
          className="relative h-screen bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: "url(/hero-bg.jpg)",
            backgroundAttachment: "fixed",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-60"></div>

          {/* Content */}
          <div className="relative z-10 text-center px-6">
            <h1 className="text-white text-4xl md:text-6xl font-bold mb-6">
              SELAMAT DATANG
              <br />
              <span className="text-emerald-400">DI PORTAL DATA RT/RW</span>
            </h1>
            <p className="text-white text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Sistem informasi terintegrasi untuk pelayanan warga yang lebih
              baik
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/warga/verify"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Cek Data Warga
              </Link>
              <Link
                href="/auth/login"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Login Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl text-black font-bold mb-4">
              LAYANAN DIGITAL
              <span className="block text-emerald-600">RT/RW</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Akses mudah ke berbagai layanan dan informasi RT/RW dengan sistem
              yang terintegrasi
            </p>
          </div>

          {/* Grid Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href} className="group block">
                <div
                  className={`
                  relative overflow-hidden rounded-xl p-6 h-52
                  bg-gradient-to-br ${action.color}
                  transform transition-all duration-300 ease-in-out
                  hover:scale-105 hover:shadow-xl
                  cursor-pointer
                `}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full"></div>
                    <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white rounded-full"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between text-white">
                    <div>
                      <div className="text-4xl mb-3">{action.icon}</div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-yellow-200 transition-colors">
                        {action.title}
                      </h3>
                    </div>

                    <div>
                      <p className="text-sm opacity-90 mb-3">
                        {action.description}
                      </p>
                      <div className="inline-flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Akses Sekarang
                        <svg
                          className="ml-2 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl text-black font-bold mb-4">
              Data RT/RW dalam Angka
            </h3>
            <div className="w-24 h-1 bg-emerald-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              { number: "1,250", label: "Total Warga", icon: "👥" },
              { number: "8", label: "RT Aktif", icon: "🏘️" },
              { number: "125", label: "UMKM Terdaftar", icon: "🏪" },
              { number: "24/7", label: "Layanan Online", icon: "⏰" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {stat.number}
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Struktur Organisasi */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl text-black font-bold mb-4">
              Struktur Pengurus RT/RW
            </h3>
            <div className="w-24 h-1 bg-emerald-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8">
            {struktur.map((person, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <span className="text-2xl sm:text-3xl text-white">👤</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-1">
                  {person.jabatan}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {person.nama}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Mulai Gunakan Layanan Digital RT/RW
          </h3>
          <p className="text-xl text-emerald-100 mb-8">
            Nikmati kemudahan akses informasi dan layanan administrasi dengan
            sistem terintegrasi
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/warga/verify"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Verifikasi Data Anda
            </Link>
            <Link
              href="/berita"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Lihat Berita Terbaru
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
