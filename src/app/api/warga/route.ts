import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
import { getSession, canUpdateWarga, WargaData } from "@/lib/auth";

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

    const allWargaData = await readGoogleSheet<WargaData>("warga");

    // Filter data based on RT/RW access dan status aktif
    // In /api/warga/route.ts
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

// Update POST function
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
    const { id, updateType, ...updateData } = await request.json();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

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
