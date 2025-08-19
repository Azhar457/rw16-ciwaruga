import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet } from "@/lib/googleSheets";
import { encrypt } from "@/lib/encrypt"; // Pastikan Anda memiliki fungsi encrypt yang sesuai
import bcrypt from "bcryptjs";

interface UserAuth {
  id: number;
  email: string;
  password_hash: string;
  role: string;
  rt_akses: string;
  rw_akses: string;
  nama_lengkap: string;
  status_aktif: string;
  last_login: string;
  subscription_status: string;
  subscription_end: string;
  created_at: string;
  verified_by: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Baca data dari Google Sheets (ganti dengan nama sheet yang sesuai)
    const authData = (await readGoogleSheet("Auth")) as unknown as UserAuth[];

    if (!authData || authData.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cari user berdasarkan email
    const user = authData.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Cek status aktif
    if (user.status_aktif !== "Aktif") {
      return NextResponse.json(
        {
          success: false,
          message: "Akun Anda tidak aktif. Hubungi administrator.",
        },
        { status: 403 }
      );
    }

    // Cek subscription (kecuali admin)
    if (user.role !== "admin" && user.subscription_status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription Anda tidak aktif. Silakan perpanjang subscription.",
          subscription_status: user.subscription_status,
        },
        { status: 403 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Buat session data
    const sessionData = {
      id: user.id,
      email: user.email,
      role: user.role,
      rt_akses: user.rt_akses,
      rw_akses: user.rw_akses,
      nama_lengkap: user.nama_lengkap,
      subscription_status: user.subscription_status,
      subscription_end: user.subscription_end,
      loginTime: new Date().toISOString(),
    };

    // Encrypt session
    const encryptedSession = await encrypt(sessionData);

    // Buat response dengan cookie
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nama_lengkap: user.nama_lengkap,
        rt_akses: user.rt_akses,
        rw_akses: user.rw_akses,
        subscription_status: user.subscription_status,
      },
    });

    // Set cookie
    response.cookies.set("session", encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });

    // Hapus cookie
    response.cookies.delete("session");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
