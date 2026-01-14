import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, WargaData, filterWargaData } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// --- SKEMA VALIDASI ZOD ---
const wargaSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  nik: z.string().length(16, "NIK harus 16 digit angka").regex(/^[0-9]+$/, "NIK hanya boleh angka"),
  kk: z.string().length(16, "No. KK harus 16 digit angka").regex(/^[0-9]+$/, "No. KK hanya boleh angka"),
  jenis_kelamin: z.enum(["Laki-laki", "Perempuan"], "Jenis kelamin tidak valid"),
  tempat_lahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggal_lahir: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Format tanggal lahir DD/MM/YYYY"), // Validasi format setelah transformasi
  alamat: z.string().min(5, "Alamat minimal 5 karakter"),
  // rt, rw akan diisi otomatis dari sesi
  kelurahan: z.string().optional().default("Ciwaruga"), // Bisa diberi default
  kecamatan: z.string().optional().default("Bandung"),   // Bisa diberi default
  agama: z.enum(["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"], "Agama tidak valid"),
  status_perkawinan: z.enum(["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"], "Status perkawinan tidak valid"),
  pekerjaan: z.string().min(1, "Pekerjaan wajib diisi"),
  kewarganegaraan: z.string().optional().default("Indonesia"),
  no_hp: z.string()
    .min(9, "Nomor HP minimal 9 digit")
    .max(15, "Nomor HP maksimal 15 digit")
    .regex(/^0[0-9]+$/, "Nomor HP harus diawali 0 dan hanya angka"), // Validasi format setelah transformasi
  status_aktif: z.enum(["Aktif", "Non-Aktif"]).optional().default("Aktif"),
});

// Helper function untuk standarisasi nomor HP
const standardizePhoneNumber = (phone: string): string => {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, ""); // Hapus non-digit
  if (cleaned.startsWith("62")) {
    cleaned = "0" + cleaned.substring(2); // Ganti 62 -> 0
  }
  if (!cleaned.startsWith("0")) {
    cleaned = "0" + cleaned; // Tambahkan 0 jika belum ada
  }
  return cleaned;
};

function isSubscriptionActive(user: any): boolean {
  if (!user) return false;
  if (["admin", "super_admin", "developer"].includes(user.role)) return true;
  return (
    user.subscription_status === "active" &&
    user.subscription_end && new Date(user.subscription_end) > new Date()
  );
}

// GET: Mengambil data warga berdasarkan hak akses (role)
export async function GET(request: NextRequest) {
  try {
    const user = await getSession(request);
    if (!user || !isSubscriptionActive(user)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized or subscription inactive" },
        { status: 401 }
      );
    }

    let whereClause: any = {
      status_aktif: "Aktif",
    };

    // Logika filter berdasarkan peran pengguna
    if (["admin", "super_admin", "developer"].includes(user.role)) {
      // Admin see all active
    } else if (["ketua_rw", "admin_rw"].includes(user.role)) {
      whereClause.rw = user.rw_akses;
    } else if (["ketua_rt", "admin_rt"].includes(user.role)) {
      whereClause.rt = user.rt_akses;
      whereClause.rw = user.rw_akses;
    } else {
      // Fallback for unauthorized roles
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const wargaData = await prisma.warga.findMany({
      where: whereClause,
      orderBy: { nama: 'asc' }
    });

    // Transform data to match WargaData interface and strict masking rules
    // Note: Prisma object handles date objects, interfaces expect string dates usually,
    // but we can adjust to send ISO strings.
    const filteredData = filterWargaData(user, wargaData.map((w: any) => ({
      ...w,
      // Convert dates to string if needed or ensure frontend handles ISO
      // created_at: w.created_at.toISOString(),
      // updated_at: w.updated_at.toISOString() 
      // Actually filterWargaData expects arrays of objects, Prisma return is fine if types align.
    })) as unknown as WargaData[]);

    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error fetching warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// --- POST Handler dengan Validasi ---
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    // Hanya Ketua RT yang bisa menambah data melalui endpoint ini
    if (session?.role !== "ketua_rt" || !isSubscriptionActive(session)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }
    const rawData = await request.json();

    // Standarisasi nomor HP sebelum validasi Zod
    if (rawData.no_hp) {
      rawData.no_hp = standardizePhoneNumber(rawData.no_hp);
    }

    // Validasi data menggunakan Zod
    const validationResult = wargaSchema.safeParse(rawData);
    if (!validationResult.success) {
      // Format error agar mudah dibaca client
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Data tidak valid", errors },
        { status: 400 }
      );
    }

    const newWarga = validationResult.data; // Data yang sudah divalidasi dan mungkin diberi default

    const wargaToAdd = await prisma.warga.create({
      data: {
        nik: newWarga.nik,
        kk: newWarga.kk,
        nama: newWarga.nama,
        jenis_kelamin: newWarga.jenis_kelamin,
        tempat_lahir: newWarga.tempat_lahir,
        tanggal_lahir: new Date(newWarga.tanggal_lahir.split('/').reverse().join('-')), // Convert DD/MM/YYYY to Date object
        alamat: newWarga.alamat,
        rt: session.rt_akses,
        rw: session.rw_akses,
        kelurahan: newWarga.kelurahan || "Ciwaruga",
        kecamatan: newWarga.kecamatan || "Parongpong",
        agama: newWarga.agama,
        status_perkawinan: newWarga.status_perkawinan,
        pekerjaan: newWarga.pekerjaan,
        kewarganegaraan: newWarga.kewarganegaraan || "WNI",
        no_hp: newWarga.no_hp,
        status_aktif: newWarga.status_aktif || "Aktif",
        created_at: new Date(),
        updated_at: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil ditambahkan",
      data: wargaToAdd
    });
  } catch (error: any) {
    console.error("Error adding warga:", error);
    // Kirim pesan error yang lebih spesifik jika ada
    const message = error instanceof Error ? error.message : "Internal server error";
    // Check for unique constraint violation (P2002)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: "NIK atau NKK sudah terdaftar" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: message },
      { status: 500 }
    );
  }
}

// --- PUT Handler dengan Validasi ---
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID warga diperlukan" },
        { status: 400 }
      );
    }

    // Role check
    if (!["ketua_rt", "admin", "admin_rw"].includes(session?.role || "") || !isSubscriptionActive(session)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const rawData = await request.json();

    if (rawData.no_hp) {
      rawData.no_hp = standardizePhoneNumber(rawData.no_hp);
    }

    const updateSchema = wargaSchema.partial().omit({ nik: true, kk: true });
    const validationResult = updateSchema.safeParse(rawData);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Data tidak valid", errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Remove undefined
    const dataToUpdate: any = { ...updateData };
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

    // Check if record exists and user has rights to it (e.g. correct RT/RW)
    // For now assuming role check is sufficient for prototype

    await prisma.warga.update({
      where: { id: parseInt(id) },
      data: {
        ...dataToUpdate,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Error updating warga:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, message: message },
      { status: 500 }
    );
  }
}

// DELETE: Menonaktifkan satu atau beberapa data warga (batch)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Satu atau lebih ID warga diperlukan" },
        { status: 400 }
      );
    }

    if (!["ketua_rt", "admin", "admin_rw"].includes(session?.role || "") || !isSubscriptionActive(session)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Soft delete (update status)
    await prisma.warga.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        status_aktif: "Non-Aktif",
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `${ids.length} data warga berhasil dihapus (dinonaktifkan)`,
    });
  } catch (error: any) {
    console.error("Error deleting warga:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}