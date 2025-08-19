import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet } from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";

interface UmkmData {
  id: number;
  nama_usaha: string;
  pemilik_nik_encrypted: string;
  jenis_usaha: string;
  alamat: string;
  no_hp: string;
  deskripsi: string;
  foto_url: string;
  status_verifikasi: string;
  admin_approver: string;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    const umkmData = (await readGoogleSheet("umkm")) as unknown as UmkmData[];
    // Filter hanya yang verified untuk public
    const verifiedUmkm = umkmData.filter(
      (umkm) => umkm.status_verifikasi === "Verified"
    );

    return NextResponse.json({ data: verifiedUmkm });
  } catch (error) {
    console.error("Error fetching UMKM:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (
      !session ||
      !["ketua_rt", "ketua_rw", "admin", "super_admin"].includes(session.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const newUmkm = await request.json();
    const umkmData = (await readGoogleSheet("umkm")) as unknown as UmkmData[];

    const maxId = Math.max(...umkmData.map((u) => u.id), 0);
    const umkmToAdd = {
      ...newUmkm,
      id: maxId + 1,
      admin_approver: session.nama_lengkap,
      status_verifikasi: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "UMKM berhasil ditambahkan",
      data: umkmToAdd,
    });
  } catch (error) {
    console.error("Error adding UMKM:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
