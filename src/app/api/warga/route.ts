import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet } from "@/lib/googleSheets";
import {
  getSession,
  canCreateWarga,
  canUpdateWarga,
  WargaData,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const allWargaData = await readGoogleSheet<WargaData>("warga");
    let filteredData: WargaData[] = [];

    if (user.role === "ketua_rw") {
      filteredData = allWargaData.filter((warga) => warga.rw === user.rw_akses);
      return NextResponse.json(filteredData);
    } else if (user.role === "ketua_rt") {
      filteredData = allWargaData.filter(
        (warga) => warga.rt === user.rt_akses && warga.rw === user.rw_akses
      );
      return NextResponse.json(filteredData);
    } else {
      return NextResponse.json([], { status: 403 });
    }
  } catch (error) {
    console.error("Error fetching warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    // Menggunakan fungsi canCreateWarga untuk memeriksa izin
    if (!session || !canCreateWarga(session)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized - Hanya Admin RT atau Super Admin yang bisa menambah data warga",
        },
        { status: 403 }
      );
    }

    const newWarga = await request.json();
    const wargaData = await readGoogleSheet<WargaData>("warga");

    const maxId = Math.max(0, ...wargaData.map((w: WargaData) => w.id));
    const wargaToAdd = {
      ...newWarga,
      id: maxId + 1,
      rt: session.rt_akses,
      rw: session.rw_akses,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Logika untuk menulis ke Google Sheet (perlu diimplementasikan jika ingin berfungsi)
    // await writeGoogleSheet("warga", [wargaToAdd]);

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil ditambahkan",
      data: {
        ...wargaToAdd,
        nik_encrypted: "***HIDDEN***",
        kk_encrypted: "***HIDDEN***",
      },
    });
  } catch (error) {
    console.error("Error adding warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { id, updateType, ...updateData } = await request.json();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Menggunakan fungsi canUpdateWarga untuk memeriksa izin
    if (!canUpdateWarga(session, updateType)) {
      const message =
        updateType === "rt_transfer"
          ? "Unauthorized - Perpindahan RT hanya bisa dilakukan Admin RW"
          : "Unauthorized - Tidak bisa mengupdate data warga";

      return NextResponse.json({ success: false, message }, { status: 403 });
    }

    // Logika untuk update data (perlu diimplementasikan)
    console.log(`Updating warga ID ${id} with data:`, updateData);

    return NextResponse.json({
      success: true,
      message:
        updateType === "rt_transfer"
          ? "Perpindahan RT berhasil diproses"
          : "Data warga berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
