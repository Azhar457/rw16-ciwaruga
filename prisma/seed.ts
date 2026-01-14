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
    console.log({ admin });

    // 2. Warga Dummy
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

    // 3. UMKM
    await prisma.uMKM.create({
        data: {
            nama_usaha: "Warung Nasi Bu Siti",
            jenis_usaha: "Kuliner",
            alamat: "Jl. Ciwaruga No. 5",
            no_hp: "081234567111",
            deskripsi: "Menyediakan nasi rames dan aneka lauk pauk enak dan murah.",
            status_verifikasi: "Verified",
        }
    });
    console.log("Seeded UMKM");

    // 4. Loker
    await prisma.loker.create({
        data: {
            posisi: "Staff Administrasi",
            perusahaan: "CV. Maju Jaya",
            deskripsi: "Dibutuhkan staff administrasi menguasai Microsoft Office.",
            lokasi: "Bandung",
            salary_range: "3.000.000 - 4.000.000",
            status_aktif: "Aktif",
            deadline: "2026-02-28",
        }
    });
    console.log("Seeded Loker");

    // 5. Berita
    await prisma.berita.create({
        data: {
            judul: "Kerja Bakti RW 16",
            konten: "Akan dilaksanakan kerja bakti membersihkan lingkungan RW 16 pada hari Minggu besok. Diharapkan kehadiran seluruh warga.",
            kategori: "Kegiatan",
            status_publish: "Published",
            published_at: new Date().toISOString(),
            penulis: "Ketua RW",
        }
    });
    console.log("Seeded Berita");

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
