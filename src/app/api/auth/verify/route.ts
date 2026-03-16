import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { success: false, message: "Email dan Kode OTP harus diisi" },
                { status: 400 }
            );
        }

        // Cari user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User tidak ditemukan" },
                { status: 404 }
            );
        }

        // Cek jika sudah aktif
        if (user.status_aktif === "Aktif") {
            return NextResponse.json(
                { success: true, message: "Akun sudah aktif" },
                { status: 200 }
            );
        }

        // Validasi OTP
        if (user.otp_code !== otp) {
            return NextResponse.json(
                { success: false, message: "Kode OTP salah" },
                { status: 400 }
            );
        }

        // Validasi Expiry
        if (!user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
            return NextResponse.json(
                { success: false, message: "Kode OTP kadaluarsa. Silakan request ulang." },
                { status: 400 }
            );
        }

        // Aktivasi Akun
        await prisma.user.update({
            where: { id: user.id },
            data: {
                status_aktif: "Aktif",
                otp_code: null, // Clear OTP
                otp_expiry: null,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Verifikasi berhasil. Akun Anda kini aktif.",
        });

    } catch (error) {
        console.error("Verify error:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
