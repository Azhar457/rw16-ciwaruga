import { NextRequest, NextResponse } from "next/server";
import { decrypt, SessionData } from "@/lib/encrypt";

// Tipe data untuk sesi pengguna setelah login
export interface SessionUser {
  id: number;
  email: string;
  role: string;
  rt_akses: string;
  rw_akses: string;
  nama_lengkap: string;
  subscription_status: string;
  subscription_end: string;
  loginTime: string;
}

// Tipe data untuk data warga
// Tipe data untuk data warga (Sesuaikan dengan Prisma Model)
export interface WargaData {
  id: number;
  nik: string;
  kk: string;
  nama: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string; // Disimpan sebagai string "YYYY-MM-DD" di database untuk konsistensi input form
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
  created_at: Date; // Prisma DateTime -> Date object
  updated_at: Date; // Prisma DateTime -> Date object
}

// Definisikan izin untuk setiap role
export const ROLE_PERMISSIONS = {
  admin: { canViewHP: true, canAccessAllRW: true, canAccessAllRT: true },
  admin_rw: { canViewHP: true, canAccessAllRW: false, canAccessAllRT: true },
  ketua_rw: { canViewHP: true, canAccessAllRW: false, canAccessAllRT: true },
  admin_rt: { canViewHP: true, canAccessAllRW: false, canAccessAllRT: false },
  ketua_rt: { canViewHP: true, canAccessAllRW: false, canAccessAllRT: false },
  admin_lembaga: { canViewHP: false, canAccessAllRW: false, canAccessAllRT: false },
} as const;

/**
 * Mengambil dan memvalidasi data sesi dari cookie permintaan.
 */
export async function getSession(request: NextRequest): Promise<SessionUser | null> {
  const sessionCookie = request.cookies.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData = await decrypt(sessionCookie);
    if (!sessionData) {
      return null;
    }

    // Validasi sederhana: sesi kadaluarsa setelah 7 hari
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const diffInDays = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60 * 24);
    if (diffInDays > 7) {
      return null;
    }

    return sessionData as SessionUser;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

/**
 * Memeriksa apakah pengguna memiliki izin tertentu.
 */
export function hasPermission(
  user: SessionUser | null,
  permission: keyof typeof ROLE_PERMISSIONS.admin
): boolean {
  if (!user || !user.role) return false;

  const rolePermissions = ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
  if (!rolePermissions) return false;

  return rolePermissions[permission] === true;
}

/**
 * Menyaring data warga berdasarkan hak akses dari sesi pengguna.
 * Fungsi ini memastikan setiap role hanya melihat data yang diizinkan dan menyembunyikan data sensitif.
 */
export function filterWargaData(user: SessionUser, wargaData: WargaData[]): Partial<WargaData>[] {
  let filteredData = wargaData;
  const canViewHP = hasPermission(user, "canViewHP");

  // Filter data berdasarkan role
  if (user.role === "admin_rw" || user.role === "ketua_rw") {
    filteredData = wargaData.filter(w => w.rw === user.rw_akses);
  } else if (user.role === "admin_rt" || user.role === "ketua_rt") {
    filteredData = wargaData.filter(
      w => w.rt === user.rt_akses && w.rw === user.rw_akses
    );
  } else if (user.role === "admin_lembaga") {
    return [];
  }
  // Role 'admin' bisa melihat semua, jadi tidak perlu difilter.

  // Sanitasi data: sembunyikan NIK/KK dan nomor HP secara default untuk SEMUA role
  // Kecuali jika ada flag khusus 'reveal' yang diizinkan (implementasi nanti)
  // Untuk saat ini, kita masking STRICTLY.
  return filteredData.map((warga) => ({
    ...warga,
    nik: "***HIDDEN***", // Override field asli jika perlu, atau gunakan field _encrypted
    kk: "***HIDDEN***",
    nik_encrypted: "***HIDDEN***", // Maintain compatibility if used
    kk_encrypted: "***HIDDEN***",
    no_hp: canViewHP ? warga.no_hp : "***HIDDEN***",
    // Developer note: Even admin should not see plain NIK/KK in list view to prevent data leaks.
    // Detail view might fetch single record with specific permission check.
  }));
}

/**
 * Memeriksa apakah pengguna boleh membuat data warga baru.
 */
export function canCreateWarga(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.role === "admin_rt" || user.role === "admin";
}

/**
 * Memeriksa apakah pengguna boleh mengupdate data warga.
 */
export function canUpdateWarga(
  user: SessionUser | null,
  updateType: "basic" | "rt_transfer"
): boolean {
  if (!user) return false;

  if (updateType === "rt_transfer") {
    return ["admin_rw", "ketua_rw", "admin"].includes(user.role);
  }

  return ["admin_rt", "admin_rw", "ketua_rw", "admin"].includes(user.role);
}