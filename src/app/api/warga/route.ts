import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
import { getSession, WargaData } from "@/lib/auth";
import {z} from "zod";

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
  return (
    user.subscription_status === "active" &&
    new Date(user.subscription_end) > new Date()
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

    const allWargaData = await readGoogleSheet<WargaData>("warga");
    let filteredData: WargaData[];

    // Logika filter berdasarkan peran pengguna
    if (["admin", "super_admin", "developer"].includes(user.role)) {
      // Admin level atas dapat melihat semua warga yang aktif
      filteredData = allWargaData.filter(
        (warga) => warga.status_aktif === "Aktif"
      );
    } else if (["ketua_rw", "admin_rw"].includes(user.role)) {
      // Ketua/Admin RW dapat melihat semua warga aktif di RW-nya
      filteredData = allWargaData.filter(
        (warga) =>
          String(warga.rw) === String(user.rw_akses) &&
          warga.status_aktif === "Aktif"
      );
    } else {
      // Ketua RT hanya bisa melihat warganya sendiri
      filteredData = allWargaData.filter(
        (warga) =>
          String(warga.rt) === String(user.rt_akses) &&
          String(warga.rw) === String(user.rw_akses) &&
          warga.status_aktif === "Aktif"
      );
    }

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

    const wargaToAdd = {
      ...newWarga,
      rt: session.rt_akses,
      rw: session.rw_akses,
      created_at: new Date().toISOString(), // Konsisten ISO format
      updated_at: new Date().toISOString(), // Konsisten ISO format
    };

    const result = await writeGoogleSheet("warga", {
      action: "append",
      data: wargaToAdd,
    });
    if (!result.success) throw new Error(result.message || "Gagal menyimpan ke Google Sheet");

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil ditambahkan",
    });
  } catch (error: any) {
    console.error("Error adding warga:", error);
    // Kirim pesan error yang lebih spesifik jika ada
    const message = error instanceof Error ? error.message : "Internal server error";
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
    // Hanya Ketua RT yang bisa mengedit data
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

    // Validasi data (gunakan partial() karena update mungkin tidak semua field)
    // Kita juga kecualikan NIK dan KK dari update jika tidak boleh diubah
    const updateSchema = wargaSchema.partial().omit({ nik: true, kk: true }); // Omit NIK/KK jika tidak boleh diedit
    const validationResult = updateSchema.safeParse(rawData);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, message: "Data tidak valid", errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(), // Konsisten ISO format
    };

    // Pastikan tidak ada field undefined yang dikirim
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);

    const result = await writeGoogleSheet("warga", {
      action: "update",
      id: parseInt(id, 10),
      data: dataToUpdate,
    });
    if (!result.success) throw new Error(result.message || "Gagal memperbarui Google Sheet");

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
    const { ids } = await request.json(); // Mengharapkan array `ids`

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Satu atau lebih ID warga diperlukan" },
        { status: 400 }
      );
    }

    // Hanya Ketua RT yang bisa menghapus
    if (session?.role !== "ketua_rt" || !isSubscriptionActive(session)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const result = await writeGoogleSheet("warga", {
      action: "batch_update_status",
      ids: ids,
      status: "Non-Aktif",
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to update status in Google Sheet");
    }

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