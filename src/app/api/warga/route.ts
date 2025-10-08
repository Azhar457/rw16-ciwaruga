import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
import { getSession, WargaData } from "@/lib/auth";

export const dynamic = "force-dynamic";

function isSubscriptionActive(user: any): boolean {
  if (!user) return false;
  return (
    user.subscription_status === "active" &&
    new Date(user.subscription_end) > new Date()
  );
}

// GET: Mengambil data warga berdasarkan hak akses (role)
export async function GET(request: NextRequest) {
  try {
    const user = await getSession(request);
    if (!user || !isSubscriptionActive(user)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized or subscription inactive" },
        { status: 401 }
      );
    }

    const allWargaData = await readGoogleSheet<WargaData>("warga");
    let filteredData: WargaData[];

    // Logika filter berdasarkan peran pengguna
    if (["admin", "super_admin", "developer"].includes(user.role)) {
      // Admin level atas dapat melihat semua warga yang aktif
      filteredData = allWargaData.filter(
        (warga) => warga.status_aktif === "Aktif"
      );
    } else if (["ketua_rw", "admin_rw"].includes(user.role)) {
      // Ketua/Admin RW dapat melihat semua warga aktif di RW-nya
      filteredData = allWargaData.filter(
        (warga) =>
          String(warga.rw) === String(user.rw_akses) &&
          warga.status_aktif === "Aktif"
      );
    } else {
      // Ketua RT hanya bisa melihat warganya sendiri
      filteredData = allWargaData.filter(
        (warga) =>
          String(warga.rt) === String(user.rt_akses) &&
          String(warga.rw) === String(user.rw_akses) &&
          warga.status_aktif === "Aktif"
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error fetching warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Menambah data warga baru
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    // Hanya Ketua RT yang bisa menambah data melalui endpoint ini
    if (session?.role !== "ketua_rt" || !isSubscriptionActive(session)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }
    const newWarga = await request.json();
    const wargaToAdd = {
      ...newWarga,
      rt: session.rt_akses,
      rw: session.rw_akses,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const result = await writeGoogleSheet("warga", {
      action: "append",
      data: wargaToAdd,
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to write to Google Sheet");
    }

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil ditambahkan",
    });
  } catch (error: any) {
    console.error("Error adding warga:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Memperbarui data warga yang ada
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID warga diperlukan" },
        { status: 400 }
      );
    }
    // Hanya Ketua RT yang bisa mengedit data
    if (session?.role !== "ketua_rt" || !isSubscriptionActive(session)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }
    const updateData = await request.json();
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };
    const result = await writeGoogleSheet("warga", {
      action: "update",
      id: parseInt(id, 10),
      data: dataToUpdate,
    });

    if (!result.success) {
       throw new Error(result.message || "Failed to update Google Sheet");
    }

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Error updating warga:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Menonaktifkan satu atau beberapa data warga (batch)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { ids } = await request.json(); // Mengharapkan array `ids`

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Satu atau lebih ID warga diperlukan" },
        { status: 400 }
      );
    }

    // Hanya Ketua RT yang bisa menghapus
    if (session?.role !== "ketua_rt" || !isSubscriptionActive(session)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const result = await writeGoogleSheet("warga", {
      action: "batch_update_status",
      ids: ids,
      status: "Non-Aktif",
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to update status in Google Sheet");
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} data warga berhasil dihapus (dinonaktifkan)`,
    });
  } catch (error: any) {
    console.error("Error deleting warga:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}