// src/app/api/warga/route.ts
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

// GET (sedikit berubah, tanpa bypassCache lagi)
export async function GET(request: NextRequest) {
  try {
    const user = await getSession(request);
    if (!user || !isSubscriptionActive(user)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
<<<<<<< HEAD

    if (!isSubscriptionActive(user)) {
      return NextResponse.json(
        { success: false, message: "Subscription inactive or expired" },
        { status: 403 }
      );
    }

    const allWargaData = await readGoogleSheet<WargaData>("warga");

    let filteredData: WargaData[];

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
      // Role lain (seperti ketua_rt) hanya bisa melihat RT-nya sendiri
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
=======
    const allWargaData = await readGoogleSheet<WargaData>("warga");
    const filteredData = allWargaData.filter(
      (warga) =>
        String(warga.rt) === String(user.rt_akses) &&
        String(warga.rw) === String(user.rw_akses) &&
        warga.status_aktif === "Aktif"
    );
    return NextResponse.json({ success: true, data: filteredData });
>>>>>>> d7df65dff7274c89372bb71a95f8442fd0781097
  } catch (error) {
    console.error("Error fetching warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST (disesuaikan dengan writeGoogleSheet baru)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
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
    if (!result.success) throw new Error(result.message);
    return NextResponse.json({
      success: true,
      message: "Data warga berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error adding warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT (disesuaikan dengan writeGoogleSheet baru)
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
    if (!result.success) throw new Error(result.message);
    return NextResponse.json({
      success: true,
      message: "Data warga berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE (diperbarui untuk menangani single dan batch delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { ids } = await request.json(); // Sekarang mengharapkan array `ids`

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "IDs warga diperlukan" },
        { status: 400 }
      );
    }

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
      throw new Error(result.message);
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} data warga berhasil dihapus (dinonaktifkan)`,
    });
  } catch (error) {
    console.error("Error deleting warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
