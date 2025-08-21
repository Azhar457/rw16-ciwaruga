import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default function HomePage() {
  // Quick action items sesuai dengan API endpoints yang sudah kita buat
  const quickActions = [
    {
      title: "Verifikasi Data Warga",
      description: "Cek data pribadi Anda dengan NIK dan No. KK",
      icon: "👤",
      href: "/warga/verify",
      color: "from-blue-500 to-emerald-500",
    },
    {
      title: "Berita Terkini",
      description: "Informasi dan pengumuman terbaru dari RT/RW",
      icon: "📰",
      href: "/berita",
      color: "from-pink-400 to-emerald-500",
    },
    {
      title: "UMKM Lokal",
      description: "Usaha Mikro Kecil Menengah di sekitar RT/RW",
      icon: "🏪",
      href: "/umkm",
      color: "from-purple-500 to-emerald-500",
    },
    {
      title: "Lowongan Kerja",
      description: "Peluang karir di sekitar wilayah RT/RW",
      icon: "💼",
      href: "/loker",
      color: "from-orange-500 to-emerald-500",
    },
    {
      title: "Login Admin",
      description: "Akses dashboard untuk pengurus RT/RW",
      icon: "🔐",
      href: "/auth/login",
      color: "from-red-500 to-emerald-500",
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
    <Navbar />
      {/* Hero Section */}
      <section>
        <div
          className="relative h-screen bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: "url(/ciwa.jpg)",
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
              <span className="text-emerald-500">DI PORTAL DATA RW 16 DESA CIWARUGA</span>
            </h1>
            <p className="text-white text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Sistem informasi terintegrasi untuk pelayanan warga yang lebih
              baik
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <Link
                href="/warga/verify"
                className="
                  bg-emerald-500 text-white font-semibold 
                  px-8 py-3 rounded-lg text-lg 
                  transition-colors duration-300
                  hover:bg-transparent hover:border-2 hover:border-white hover:text-white
                "
              >
                Cek Data Warga
              </Link>

              <Link
                href="/auth/login"
                className="bg-transparent border-2 border-white text-white hover:bg-emerald-500 hover:text-white hover:border-emerald-500 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Login Admin
              </Link>
            </div>
          </div>
        </div>
      </section>


       {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-200">
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
<section className="py-16 bg-white">
  <div className="container mx-auto px-6 lg:px-12">
    {/* Judul */}
    <div className="text-center mb-12">
      <h1 className="text-3xl md:text-4xl font-bold">
        <span className="text-emerald-500">SAMBUTAN KETUA RW</span>
      </h1>
    </div>

    {/* Grid 2 Kolom */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
      
      {/* Bagian Gambar */}
      <div className="flex justify-center">
        <div className="w-72 h-96 rounded-3xl overflow-hidden border-4 border-emerald-100 shadow-lg">
          <Image
            src="/Ramon.JPG"
            alt="Ketua RW"
            width={2240}
            height={3200}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bagian Teks */}
      <div className="lg:col-span-2">
        <div className="bg-gradient-to-b from-emerald-100 to-white rounded-2xl p-8 shadow-inner max-h-96 overflow-y-auto">
          <div className="prose max-w-none">
            
            {/* Nama & Jabatan */}
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-xl font-bold text-emerald-800 ">Ramon Arcturus</h2>
              <h3 className="text-lg font-bold text-emerald-800">Ketua RW 19</h3>
            </div>

            {/* Isi Sambutan */}
            <p className="text-gray-700 leading-relaxed">
              <span className="block text-lg font-medium text-emerald-800 mb-4">
                Assalamualaikum Warahmatullahi Wabarakatuh, Sobat Warga!
              </span>
              
            Alhamdulillah, dengan izin Allah kita bisa bareng-bareng hadir di era digital ini. Website RW ini hadir bukan cuma buat info resmi, tapi juga jadi ruang komunikasi, kolaborasi, dan kreativitas warga.
Di RW kita, semangatnya adalah Kebersamaan, inovatif, dan peduli lingkungan. Kita pengen semua generasi—terutama anak muda Gen Z—punya peran nyata buat bikin lingkungan lebih keren dan bermanfaat.
              
              <span className="block font-semibold my-4">Visi kita jelas:</span>
              • Lingkungan nyaman, aman, dan sehat<br />
              • Generasi muda aktif, kreatif, dan produktif<br />
              • Administrasi serba cepat dengan teknologi digital<br /><br />
              
              <span className="block font-semibold my-4">Layanan Unggulan:</span>
              - Layanan administrasi online<br />
              - Posyandu modern & ramah warga<br />
              - Sistem pengaduan digital biar suara warga lebih didengar<br />
              - Info kegiatan RW yang selalu update<br /><br />
              Kita percaya, perubahan besar dimulai dari hal kecil di sekitar kita.
               Dengan energi positif warga, terutama anak muda, kita bisa wujudkan RW yang maju dan memberi dampak nyata.

              <span className=" font-bold mt-5 block italic text-emerald-800">
                "Bersama Ramon, Membangun Negeri dari Lingkungan Sendiri!"
              </span><br /><br />
              
              <span className="block text-right font-medium text-emerald-800">
                Wassalamualaikum Warahmatullahi Wabarakatuh<br />
                Hormat kami,<br />
                <span className="text-lg font-bold">Ramon Arcturus</span>
              </span>
            </p>
          </div>
        </div>
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
              <span className="block text-emerald-500">RT/RW</span>
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
                  relative overflow-hidden rounded-xl p-6 h-60
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
                      <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-300 transition-colors">
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

  <section className="relative py-16 bg-gradient-to-r from-emerald-600 to-emerald-200">
    <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 z-0">
    <svg
      className="relative block w-full h-12"
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
        fill="#ffffff"
      />
    </svg>
  </div>
  {/* Isi konten */}
  <div className="py-16 lg:py-20 relative z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h3 className="text-2xl lg:text-3xl text-white font-bold mb-4">
          Data RT/RW dalam Angka
        </h3>
        <div className="w-24 h-1 bg-white mx-auto"></div>
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
            <div className="text-3xl font-bold text-emerald-500 mb-2">
              {stat.number}
            </div>
            <p className="text-gray-600 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Wave SVG di bawah */}
  <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 ">
    <svg
      className="relative block w-full h-10"
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
        fill="#ffffff"
      />
    </svg>
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

     {/* Peta Lokasi */}
<section className="py-16 bg-white mb-22">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h3 className="text-2xl lg:text-3xl text-black font-bold mb-4">
        Lokasi Wilayah RW 19
      </h3>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Peta interaktif wilayah untuk memudahkan warga menemukan lokasi RW 19
      </p>
      <div className="w-24 h-1 bg-emerald-500 mx-auto mt-4"></div>
    </div>

    <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
      <iframe
        src="https://www.google.com/maps/d/embed?mid=1uxuIlwGvPyLbw8lHj4sy6rUoI4yZS80&usp=sharing"
        width="100%"
        height="480"
        className="w-full h-[480px] md:h-[600px]"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
      ></iframe>
    </div>
  </div>
</section>



     

      <Footer />
    </>
  );
}
