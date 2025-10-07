import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
import { getSession, canUpdateWarga, WargaData } from "@/lib/auth";

export const dynamic = "force-dynamic";

function isSubscriptionActive(user: any): boolean {
  return (
    user.subscription_status === "active" &&
    new Date(user.subscription_end) > new Date()
  );
}

// Update GET function
export async function GET(request: NextRequest) {
  try {
    const user = await getSession(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check subscription
    if (!isSubscriptionActive(user)) {
      return NextResponse.json(
        { success: false, message: "Subscription inactive or expired" },
        { status: 403 }
      );
    }

    // PERUBAHAN DI SINI: Tambahkan 'true' untuk bypass cache internal
    const allWargaData = await readGoogleSheet<WargaData>("warga", true);

    // Filter data based on RT/RW access dan status aktif
    const filteredData = allWargaData.filter(
      (warga: WargaData) =>
        String(warga.rt) === String(user.rt_akses) &&
        String(warga.rw) === String(user.rw_akses) &&
        warga.status_aktif === "Aktif"
    );

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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role and subscription
    if (session.role !== "ketua_rt" || !isSubscriptionActive(session)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Requires active Ketua RT subscription",
        },
        { status: 403 }
      );
    }

    const newWarga = await request.json();

    // Validate RT/RW access
    if (
      String(newWarga.rt) !== String(session.rt_akses) ||
      String(newWarga.rw) !== String(session.rw_akses)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Can only add data for assigned RT/RW",
        },
        { status: 403 }
      );
    }

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

    const result = await writeGoogleSheet("warga", wargaToAdd);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil ditambahkan",
      data: wargaToAdd,
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

    // Pastikan admin RT tidak mengubah data RT/RW
    if (
      String(updateData.rt) !== String(session.rt_akses) ||
      String(updateData.rw) !== String(session.rw_akses)
    ) {
      return NextResponse.json(
        { success: false, message: "Anda tidak dapat mengubah data RT/RW" },
        { status: 403 }
      );
    }

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
      throw new Error(result.message);
    }

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
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    const { id } = await request.json();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role and subscription
    if (session.role !== "ketua_rt" || !isSubscriptionActive(session)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Requires active Ketua RT subscription",
        },
        { status: 403 }
      );
    }

    // Update status to non-aktif instead of deleting
    const result = await writeGoogleSheet("warga", {
      action: "update",
      id,
      data: {
        status_aktif: "Non-Aktif",
        updated_at: new Date().toISOString(),
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data warga berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting warga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
