import { NextRequest, NextResponse } from "next/server";
import { verifyWargaData } from "@/lib/googleSheets";

export async function POST(request: NextRequest) {
  try {
    const { nik, kk } = await request.json();

    if (!nik || !kk) {
      return NextResponse.json(
        { success: false, message: "NIK dan Nomor KK harus diisi" },
        { status: 400 }
      );
    }

    // Log verification attempt for security
    await logVerificationAttempt(request, nik, kk);

    // Use Apps Script verification
    const foundWarga = await verifyWargaData(nik, kk);

    if (!foundWarga) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak ditemukan atau NIK/KK tidak sesuai",
        },
        { status: 404 }
      );
    }

    // Return found data (NIK/KK already filtered by Apps Script)
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

async function logVerificationAttempt(
  request: NextRequest,
  nik: string,
  kk: string
) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") || 
      request.headers.get("x-real-ip") || 
      "unknown";

    // Log to your logging system
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action_type: "VERIFY_ATTEMPT",
        ip_address: ip,
        details: {
          nik_partial: nik.substring(0, 4) + "***",
          kk_partial: kk.substring(0, 4) + "***",
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } catch (error) {
    console.error("Failed to log verification attempt:", error);
  }
}
