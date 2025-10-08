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
    const session = await getSession(request);
    const lokerData = await readGoogleSheet<any>("loker");
    if (
      session &&
      ["admin", "super_admin", "admin_rw"].includes(session.role)
    ) {
      return NextResponse.json(lokerData);
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeLoker = lokerData.filter((loker) => {
        const isActive = loker.status_aktif === "Aktif";
        const deadlineDate = new Date(loker.deadline as string);
        deadlineDate.setHours(0, 0, 0, 0);
        return isActive && deadlineDate >= today;
      });
      return NextResponse.json(activeLoker);
    }
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
    const newLoker = await request.json();
    const lokerToAdd = {
      ...newLoker,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = await writeGoogleSheet("loker", {
      action: "append",
      data: lokerToAdd,
    });
    if (!result.success) throw new Error(result.message);
    return NextResponse.json({
      success: true,
      message: "Lowongan berhasil ditambahkan",
      data: lokerToAdd,
    });
  } catch (error: any) {
    console.error("Error adding loker:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID loker harus disertakan" },
        { status: 400 }
      );
    }
    const lokerToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };
    const result = await writeGoogleSheet("loker", {
      action: "update",
      id,
      data: lokerToUpdate,
    });
    if (!result.success) throw new Error(result.message);
    return NextResponse.json({
      success: true,
      message: "Lowongan berhasil diperbarui",
      data: { id, ...lokerToUpdate },
    });
  } catch (error: any) {
    console.error("Error updating loker:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json(); // Menggunakan 'ids' untuk batch delete
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "ID loker harus disertakan" },
        { status: 400 }
      );
    }
    const result = await writeGoogleSheet("loker", {
      action: "batch_update_status",
      ids: ids,
      status: "Non-Aktif",
    });
    if (!result.success) throw new Error(result.message);
    return NextResponse.json({
      success: true,
      message: `${ids.length} loker berhasil dihapus`,
    });
  } catch (error: any) {
    console.error("Error deleting loker:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
