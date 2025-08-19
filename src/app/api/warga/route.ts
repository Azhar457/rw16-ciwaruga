import { NextRequest, NextResponse } from "next/server";
import {
  readGoogleSheet,
} from "@/lib/googleSheets";
import {
  getSession,
  filterWargaData,
  canCreateWarga,
  canUpdateWarga,
  WargaData,
  SessionUser,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const wargaData = await readGoogleSheet<WargaData>("warga");
    const filteredData = filterWargaData(session, wargaData);

    return NextResponse.json(filteredData);
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

    if (!session || !canCreateWarga(session)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized - Hanya Admin RT yang bisa menambah data warga",
        },
        { status: 403 }
      );
    }

    const newWarga = await request.json();
    const wargaData = await readGoogleSheet<WargaData>("warga");

    const maxId = Math.max(...wargaData.map((w: WargaData) => w.id), 0);
    const wargaToAdd = {
      ...newWarga,
      id: maxId + 1,
      rt: session.rt_akses,
      rw: session.rw_akses,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await logActivity(
      session,
      "create",
      "warga",
      wargaToAdd.id,
      null,
      wargaToAdd
    );

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

    if (!canUpdateWarga(session, updateType)) {
      const message =
        updateType === "rt_transfer"
          ? "Unauthorized - Perpindahan RT hanya bisa dilakukan Admin RW"
          : "Unauthorized - Tidak bisa mengupdate data warga";

      return NextResponse.json({ success: false, message }, { status: 403 });
    }

    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    if (updateType === "rt_transfer") {
      dataToUpdate.rt = updateData.new_rt;
      dataToUpdate.rw = updateData.new_rw || session.rw_akses;
    }
    await logActivity(session, "update", "warga", id, null, dataToUpdate);

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

async function logActivity(
  session: SessionUser,
  action: string,
  table: string,
  recordId: number,
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown>
) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_email: session.email,
        user_role: session.role,
        action_type: action,
        table_affected: table,
        record_id: recordId.toString(),
        old_data: oldData,
        new_data: newData,
      }),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
