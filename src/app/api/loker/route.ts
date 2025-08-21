import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";

const headers = [
  "id",
  "posisi",
  "perusahaan",
  "deskripsi",
  "gambar_url",
  "requirements",
  "salary_range",
  "lokasi",
  "contact_method",
  "contact_person",
  "status_aktif",
  "admin_poster",
  "deadline",
  "created_at",
  "updated_at",
];

export async function GET(request: NextRequest) {
  try {
    // Cek session atau token di sini
    const session = await getSession(request);

    const lokerData = await readGoogleSheet("loker");

    if (session && session.role === "admin") {
      // Jika admin, kirim semua data
      return NextResponse.json(lokerData);
    } else {
      // Jika bukan admin, filter hanya yang aktif dan belum expired
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeLoker = lokerData.filter((loker: Record<string, any>) => {
        const isActive = loker.status_aktif === "Aktif";
        const deadlineDate = new Date(loker.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const notExpired = deadlineDate >= today;
        return isActive && notExpired;
      });

      return NextResponse.json(activeLoker);
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newLoker = await request.json();
    const lokerData = await readGoogleSheet("loker");
    const maxId = Math.max(
      ...lokerData.map((l: Record<string, any>) => Number(l.id) || 0),
      0
    );

    const lokerToAdd: Record<string, string | number> = {};
    headers.forEach((h) => {
      lokerToAdd[h] =
        h === "id"
          ? maxId + 1
          : h === "created_at" || h === "updated_at"
          ? new Date().toISOString()
          : newLoker[h] ?? "";
    });

    const writeResult = await writeGoogleSheet("loker", lokerToAdd);
    if (!writeResult.success) {
      return NextResponse.json(
        { success: false, message: writeResult.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Lowongan kerja berhasil ditambahkan",
      data: lokerToAdd,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updatedLoker = await request.json();
    if (!updatedLoker.id) {
      return NextResponse.json(
        { success: false, message: "ID loker harus disertakan" },
        { status: 400 }
      );
    }
    const lokerData = await readGoogleSheet("loker");
    const index = lokerData.findIndex(
      (l: Record<string, any>) => Number(l.id) === Number(updatedLoker.id)
    );
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Loker tidak ditemukan" },
        { status: 404 }
      );
    }

    const lokerToUpdate: Record<string, string | number> = {};
    headers.forEach((h) => {
      lokerToUpdate[h] =
        h === "updated_at"
          ? new Date().toISOString()
          : updatedLoker[h] ?? lokerData[index][h] ?? "";
    });

    // Kirim ke Apps Script dengan action "update"
    const writeResult = await writeGoogleSheet("loker", {
      action: "update",
      id: lokerToUpdate.id,
      data: lokerToUpdate,
    });
    if (!writeResult.success) {
      return NextResponse.json(
        { success: false, message: writeResult.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Lowongan kerja berhasil diperbarui",
      data: lokerToUpdate,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID loker harus disertakan" },
        { status: 400 }
      );
    }
    // Kirim ke Apps Script dengan action "delete"
    const writeResult = await writeGoogleSheet("loker", {
      action: "delete",
      id,
    });
    if (!writeResult.success) {
      return NextResponse.json(
        { success: false, message: writeResult.message },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Lowongan kerja berhasil dihapus",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
