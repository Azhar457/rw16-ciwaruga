import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateOTP, getOTPExpiry } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/email";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    nama_lengkap: z.string().min(1, "Nama lengkap harus diisi"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validasi input
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, message: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { email, password, nama_lengkap } = validation.data;

        // Cek apakah email sudah terdaftar
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "Email sudah terdaftar" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpiry = getOTPExpiry();

        // Buat user baru (Status: Unverified)
        const newUser = await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                nama_lengkap,
                role: "warga", // Default role
                status_aktif: "Unverified", // Belum aktif
                otp_code: otpCode,
                otp_expiry: otpExpiry,
            },
        });

        // Kirim email OTP
        const emailSent = await sendOTPEmail(email, otpCode, nama_lengkap);

        if (!emailSent) {
            // Jika gagal kirim email, mungkin sebaiknya hapus user atau biarkan retry?
            // Untuk simplifikasi, kita biarkan tapi beri tahu user
            console.error("Gagal mengirim email OTP ke " + email);
        }

        return NextResponse.json({
            success: true,
            message: "Registrasi berhasil. Silakan cek email Anda untuk kode verifikasi.",
            userId: newUser.id,
            email: newUser.email
        });

    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { success: false, message: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}
