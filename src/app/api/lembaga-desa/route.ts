import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";

interface LembagaData {
  id: number;
  nama_lembaga: string;
  ketua: string;
  sekretaris: string;
  bendahara: string;
  program_kerja: string;
  kontak: string;
  alamat_sekretariat: string;
  status_aktif: string;
  created_at: string;
}

export async function GET() {
  try {
    const lembagaData = (await readGoogleSheet(
      "lembaga_desa"
    )) as LembagaData[];

    // Filter hanya yang aktif untuk public
    const activeLembaga = lembagaData.filter(
      (lembaga) => lembaga.status_aktif === "aktif"
    );

    return NextResponse.json(activeLembaga);
  } catch (error) {
    console.error("Error fetching lembaga:", error);
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

    const newLembaga = await request.json();
    const lembagaData = (await readGoogleSheet(
      "lembaga_desa"
    )) as LembagaData[];

    const maxId = Math.max(...lembagaData.map((l) => l.id), 0);
    const lembagaToAdd = {
      ...newLembaga,
      id: maxId + 1,
      created_at: new Date().toISOString(),
    };

    await writeGoogleSheet("lembaga_desa", [lembagaToAdd]);

    return NextResponse.json({
      success: true,
      message: "Data lembaga berhasil ditambahkan",
      data: lembagaToAdd,
    });
  } catch (error) {
    console.error("Error adding lembaga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
