import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { nik, kk } = await request.json();

    if (!nik || !kk) {
      return NextResponse.json(
        { success: false, message: "NIK dan Nomor KK harus diisi" },
        { status: 400 }
      );
    }

    // Capture IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // 1. Log verification attempt (to DB directly essentially)
    await prisma.logAktivitas.create({
      data: {
        action_type: "VERIFY_ATTEMPT",
        ip_address: ip,
        new_data: JSON.stringify({
          nik_partial: nik.substring(0, 4) + "***",
          kk_partial: kk.substring(0, 4) + "***",
        }),
        timestamp: new Date()
      }
    });

    // 2. Search in DB
    const foundWarga = await prisma.warga.findFirst({
      where: {
        nik: nik,
        kk: kk,
        status_aktif: "Aktif"
      }
    });

    if (!foundWarga) {
      // Logic for failed attempt counting could be added here if calling api/blokir-attempts internally
      // or client side calls it. Original code didn't obvious link, but the logging above is for general audit.

      return NextResponse.json(
        {
          success: false,
          message: "Data tidak ditemukan atau NIK/KK tidak sesuai",
        },
        { status: 404 }
      );
    }

    // 3. Return found data (Masked/Filtered usually, but verification usually returns detail confirmation?)
    // Original code returned foundWarga. User likely expects to see their data if NIK/KK matches.

    return NextResponse.json({
      success: true,
      message: "Data berhasil ditemukan",
      data: foundWarga,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
