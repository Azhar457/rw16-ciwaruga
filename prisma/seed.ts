import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("password", 10);

    // 1. User
    const admin = await prisma.user.upsert({
        where: { email: "admin@rw16.com" },
        update: {},
        create: {
            email: "admin@rw16.com",
            nama_lengkap: "Admin RW 16",
            password_hash: passwordHash,
            role: "admin",
            status_aktif: "Aktif",
            subscription_status: "active",
            rt_akses: "00",
            rw_akses: "16",
        },
    });

    // Developer User
    await prisma.user.upsert({
        where: { email: "dev@ciwaruga.com" },
        update: {},
        create: {
            email: "dev@ciwaruga.com",
            nama_lengkap: "Developer Utama",
            password_hash: passwordHash,
            role: "developer",
            status_aktif: "Aktif",
            subscription_status: "active",
            rt_akses: "00",
            rw_akses: "16",
        },
    });

    console.log({ admin });

    // 2. Warga Dummy
    const wargaCount = await prisma.warga.count();
    if (wargaCount === 0) {
        await prisma.warga.createMany({
            data: [
                {
                    nik: "3277010101000001",
                    kk: "3277010101000001",
                    nama: "Budi Santoso",
                    jenis_kelamin: "Laki-laki",
                    tempat_lahir: "Bandung",
                    tanggal_lahir: "1980-01-01",
                    alamat: "Jl. Ciwaruga No. 1",
                    rt: "01",
                    rw: "16",
                    kelurahan: "Ciwaruga",
                    kecamatan: "Parongpong",
                    agama: "Islam",
                    status_perkawinan: "Kawin",
                    pekerjaan: "Wiraswasta",
                    kewarganegaraan: "WNI",
                    no_hp: "081234567890",
                    status_aktif: "Aktif",
                },
                {
                    nik: "3277010101000002",
                    kk: "3277010101000001",
                    nama: "Siti Aminah",
                    jenis_kelamin: "Perempuan",
                    tempat_lahir: "Cimahi",
                    tanggal_lahir: "1985-05-05",
                    alamat: "Jl. Ciwaruga No. 1",
                    rt: "01",
                    rw: "16",
                    kelurahan: "Ciwaruga",
                    kecamatan: "Parongpong",
                    agama: "Islam",
                    status_perkawinan: "Kawin",
                    pekerjaan: "Ibu Rumah Tangga",
                    kewarganegaraan: "WNI",
                    no_hp: "081234567891",
                    status_aktif: "Aktif",
                }
            ],
            skipDuplicates: true,
        });
        console.log("Seeded Warga");
    }

    // 3. UMKM
    const umkmCount = await prisma.uMKM.count();
    if (umkmCount === 0) {
        await prisma.uMKM.create({
            data: {
                nama_usaha: "Warung Nasi Bu Siti",
                jenis_usaha: "Kuliner",
                alamat: "Jl. Ciwaruga No. 5",
                no_hp: "081234567111",
                deskripsi: "Menyediakan nasi rames dan aneka lauk pauk enak dan murah.",
                status_verifikasi: "Verified",
                foto_url: "/desa1.jpeg"
            }
        });
        console.log("Seeded UMKM");
    }

    // 4. Loker
    const lokerCount = await prisma.loker.count();
    if (lokerCount === 0) {
        await prisma.loker.create({
            data: {
                posisi: "Staff Administrasi",
                perusahaan: "CV. Maju Jaya",
                deskripsi: "Dibutuhkan staff administrasi menguasai Microsoft Office.",
                lokasi: "Bandung",
                salary_range: "3.000.000 - 4.000.000",
                status_aktif: "Aktif",
                deadline: "2026-02-28",
                gambar_url: "/desa3.jpeg"
            }
        });
        console.log("Seeded Loker");
    }

    // 5. Berita
    const beritaCount = await prisma.berita.count();
    if (beritaCount === 0) {
        await prisma.berita.createMany({
            data: [
                {
                    judul: "Penyaluran BLT Dana Desa 2025",
                    konten: "Desa Ciwaruga aktif dalam menjalankan program BLT Dana Desa untuk membantu warga yang membutuhkan.",
                    kategori: "Pemerintahan",
                    status_publish: "Published",
                    published_at: new Date().toISOString(),
                    penulis: "Administrator",
                    views: 76,
                    foto_url: "/bgg.jpg"
                },
                {
                    judul: "PERINGATAN 1 MUHARAM 1447H DESA CIWARUGA",
                    konten: "Kegiatan peringatan Tahun Baru Islam di Desa Ciwaruga berlangsung khidmat dan meriah.",
                    kategori: "Kegiatan Desa",
                    status_publish: "Published",
                    published_at: new Date().toISOString(),
                    penulis: "Administrator",
                    views: 36,
                    foto_url: "/desa1.jpeg"
                },
                {
                    judul: "Pengecoran Jalan Kabupaten",
                    konten: "Pemerintah Desa bersama Kabupaten Bandung Barat melaksanakan pengecoran jalan utama.",
                    kategori: "Infrastruktur",
                    status_publish: "Published",
                    published_at: new Date().toISOString(),
                    penulis: "Administrator",
                    views: 43,
                    foto_url: "/desa4.jpeg"
                }
            ]
        });
        console.log("Seeded Berita");
    }

    // 6. Lembaga Desa
    const lembagaCount = await prisma.lembagaDesa.count();
    if (lembagaCount === 0) {
        await prisma.lembagaDesa.create({
            data: {
                nama_lembaga: "Karang Taruna RW 16",
                ketua: "Asep Sunandar",
                sekretaris: "Budi",
                bendahara: "Ani",
                program_kerja: "Bersih desa, Turnamen Voli",
                status_aktif: "Aktif"
            }
        });
        console.log("Seeded LembagaDesa");
    }

    // 7. BPH (Badan Pengurus Harian)
    const bphCount = await prisma.bPH.count();
    if (bphCount === 0) {
        await prisma.bPH.create({
            data: {
                nama: "H. Dadang",
                jabatan: "Ketua RW",
                periode_start: "2024",
                periode_end: "2029",
                status_aktif: "Aktif",
                bio: "Ketua RW 16 periode 2024-2029"
            }
        });
        console.log("Seeded BPH");
    }

}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
