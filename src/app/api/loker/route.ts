import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet} from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";

interface LokerData {
  id: number;
  posisi: string;
  perusahaan: string;
  deskripsi: string;
  gambar_url: string;
  requirements: string;
  salary_range: string;
  lokasi: string;
  contact_method: string;
  contact_person: string;
  status_aktif: string;
  admin_poster: string;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    const lokerData = (await readGoogleSheet(
      "loker"
    )) as unknown as LokerData[];

    // Filter hanya yang aktif dan belum expired
    const activeLoker = lokerData.filter((loker) => {
      const isActive = loker.status_aktif === "Aktif";
      const notExpired = new Date(loker.deadline) > new Date();
      return isActive && notExpired;
    });

    return NextResponse.json(activeLoker);
  } catch (error) {
    console.error("Error fetching loker:", error);
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

    const newLoker = await request.json();
    const lokerData = (await readGoogleSheet(
      "loker"
    )) as unknown as LokerData[];

    const maxId = Math.max(...lokerData.map((l) => l.id), 0);
    const lokerToAdd = {
      ...newLoker,
      id: maxId + 1,
      admin_poster: session.nama_lengkap,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return NextResponse.json({
      success: true,
      message: "Lowongan kerja berhasil ditambahkan",
      data: lokerToAdd,
    });
  } catch (error) {
    console.error("Error adding loker:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
