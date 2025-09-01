import { NextRequest, NextResponse } from "next/server";
import {
  readGoogleSheet,
  writeGoogleSheet,
  filterActiveRecords,
} from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";

interface BPHData {
  [key: string]: unknown;
  id: number;
  nama: string;
  jabatan: string;
  periode_start: string;
  periode_end: string;
  foto_url: string;
  kontak: string;
  bio: string;
  status_aktif: string;
  created_at: string;
}

export async function GET() {
  try {
    const bphData = (await readGoogleSheet("bph")) as BPHData[];

    // Menggunakan fungsi filter yang sudah ada dan andal
    const activeBPH = filterActiveRecords(bphData);

    return NextResponse.json(activeBPH);
  } catch (error) {
    console.error("Error fetching BPH:", error);
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
      !["ketua_rw", "admin", "super_admin"].includes(session.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const newBPH = await request.json();
    const bphData = (await readGoogleSheet("bph")) as BPHData[];

    const maxId = Math.max(0, ...bphData.map((b) => b.id));
    const bphToAdd = {
      ...newBPH,
      id: maxId + 1,
      created_at: new Date().toISOString(),
    };

    await writeGoogleSheet("bph", bphToAdd);

    return NextResponse.json({
      success: true,
      message: "Data BPH berhasil ditambahkan",
      data: bphToAdd,
    });
  } catch (error) {
    console.error("Error adding BPH:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
