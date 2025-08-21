import { NextRequest } from "next/server";
import { decrypt, SessionData } from "@/lib/encrypt";
import jwt from "jsonwebtoken";

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

export const ROLE_PERMISSIONS = {
  admin: {
    canViewNIK: false,
    canViewKK: false,
    canViewHP: true,
    canManageUsers: true,
    canManageSubscriptions: true,
    canAccessAllRW: true,
    canAccessAllRT: true,
    canManageBerita: true,
    canManageLembaga: true,
    description: "Admin lembaga - full access except NIK/KK",
  },
  admin_rw: {
    canViewNIK: false,
    canViewKK: false,
    canViewHP: true,
    canManageUsers: true,
    canManageSubscriptions: false,
    canAccessAllRW: false,
    canAccessAllRT: true,
    canManageBerita: true,
    canManageLembaga: false,
    description: "Admin RW - manage RTs in RW",
  },
  ketua_rw: {
    canViewNIK: false,
    canViewKK: false,
    canViewHP: true,
    canManageUsers: true,
    canManageSubscriptions: false,
    canAccessAllRW: false,
    canAccessAllRT: true,
    canManageBerita: true,
    canManageLembaga: false,
    description: "Ketua RW - lead RW operations",
  },
  admin_rt: {
    canViewNIK: false,
    canViewKK: false,
    canViewHP: true,
    canManageUsers: true,
    canManageSubscriptions: false,
    canAccessAllRW: false,
    canAccessAllRT: false,
    canManageBerita: true,
    canManageLembaga: false,
    description: "Admin RT - manage RT only",
  },
  ketua_rt: {
    canViewNIK: false,
    canViewKK: false,
    canViewHP: true,
    canManageUsers: false,
    canManageSubscriptions: false,
    canAccessAllRW: false,
    canAccessAllRT: false,
    canManageBerita: true,
    canManageLembaga: false,
    description: "Ketua RT - lead RT operations",
  },
  admin_lembaga: {
    canViewNIK: false,
    canViewKK: false,
    canViewHP: false,
    canManageUsers: false,
    canManageSubscriptions: false,
    canAccessAllRW: false,
    canAccessAllRT: false,
    canManageBerita: true,
    canManageLembaga: true,
    description: "Admin lembaga - manage organization content only",
  },
} as const;

export interface WargaData {
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

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data: Record<string, string>;
}

export async function getSession(
  request: NextRequest
): Promise<SessionUser | null> {
  try {
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const sessionData: SessionData | null = await decrypt(sessionCookie);

    if (!sessionData) {
      return null;
    }

    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const diffInDays =
      (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays > 7) {
      return null;
    }

    return sessionData as SessionUser;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

export function hasPermission(
  user: SessionUser | null,
  permission: keyof typeof ROLE_PERMISSIONS.admin
): boolean {
  if (!user) return false;

  const rolePermissions =
    ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS];
  if (!rolePermissions) return false;

  return rolePermissions[permission] === true;
}

export function canViewSensitiveData(): boolean {
  return false;
}

export function canViewPhoneNumbers(user: SessionUser | null): boolean {
  return hasPermission(user, "canViewHP");
}

export function filterWargaData(
  user: SessionUser | null,
  wargaData: WargaData[]
): WargaData[] {
  if (!user) return [];

  let filteredData = wargaData;

  if (user.role === "admin_rw" || user.role === "ketua_rw") {
    filteredData = filteredData.filter((w) => w.rw === user.rw_akses);
  } else if (user.role === "admin_rt" || user.role === "ketua_rt") {
    filteredData = filteredData.filter(
      (w) => w.rt === user.rt_akses && w.rw === user.rw_akses
    );
  } else if (user.role === "admin_lembaga") {
    return [];
  }

  return filteredData.map((warga) => ({
    ...warga,
    nik_encrypted: "***HIDDEN***",
    kk_encrypted: "***HIDDEN***",
    no_hp: hasPermission(user, "canViewHP") ? warga.no_hp : "***HIDDEN***",
  }));
}

export function canCreateWarga(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.role === "admin_rt" || user.role === "admin";
}

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

export function canManageBerita(
  user: SessionUser | null,
  beritaScope?: string
): boolean {
  if (!user) return false;

  if (user.role === "admin_lembaga") {
    return beritaScope === user.nama_lengkap;
  }

  return hasPermission(user, "canManageBerita");
}

export function checkRole(
  user: SessionUser | null,
  allowedRoles: string[]
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export function checkRTAccess(
  user: SessionUser | null,
  requiredRT: string
): boolean {
  if (!user) return false;

  if (hasPermission(user, "canAccessAllRT")) return true;

  if (["admin_rt", "ketua_rt"].includes(user.role)) {
    return user.rt_akses === requiredRT;
  }

  return false;
}

export function checkRWAccess(
  user: SessionUser | null,
  requiredRW: string
): boolean {
  if (!user) return false;

  if (hasPermission(user, "canAccessAllRW")) return true;

  if (["admin_rw", "ketua_rw"].includes(user.role)) {
    return user.rw_akses === requiredRW;
  }

  if (["admin_rt", "ketua_rt"].includes(user.role)) {
    return user.rw_akses === requiredRW;
  }

  return false;
}

export function checkSubscription(user: SessionUser | null): boolean {
  if (!user) return false;

  if (user.role === "admin") return true;

  if (user.subscription_status !== "active") return false;

  const endDate = new Date(user.subscription_end);
  const now = new Date();

  return endDate > now;
}

export function validateInput(
  data: unknown,
  requiredFields: string[]
): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, string> = {};

  if (!data || typeof data !== "object") {
    return {
      isValid: false,
      errors: ["Invalid data format"],
      data: {},
    };
  }

  const inputData = data as Record<string, unknown>;

  for (const field of requiredFields) {
    const value = inputData[field];
    if (!value || typeof value !== "string" || value.trim() === "") {
      errors.push(`Field ${field} is required`);
    } else {
      sanitizedData[field] = value.trim();
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData,
  };
}

export function createUnauthorizedResponse(
  message: string = "Unauthorized"
): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function createForbiddenResponse(
  message: string = "Forbidden"
): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

export function isBusinessHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 6 && hour <= 22;
}

export function checkRateLimit(): boolean {
  return true;
}
export async function verifySession(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  if (!token) return null;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    return { user };
  } catch {
    return null;
  }
}
