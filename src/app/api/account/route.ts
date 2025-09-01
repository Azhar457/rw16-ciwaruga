import { NextRequest, NextResponse } from "next/server";
import {
  readGoogleSheet,
  writeGoogleSheet,
  updateGoogleSheet,
} from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

interface AccountData {
  id: number;
  email: string;
  password_hash: string;
  role: string;
  rt_akses: string;
  rw_akses: string;
  nama_lengkap: string;
  status_aktif: string;
  last_login: string;
  subscription_status: string;
  subscription_end: string;
  created_at: string;
  updated_at: string;
  verified_by?: string;
  [key: string]: string | number | undefined;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    // Hanya developer yang boleh akses
    if (!session || session.role !== "developer") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const accountData = await readGoogleSheet<AccountData>("account");

    const safeAccountData = accountData.map((acc) => ({
      ...acc,
      password_hash: "***HIDDEN***",
    }));

    return NextResponse.json(safeAccountData);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || session.role !== "developer") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { email, password, role, rt_akses, rw_akses, nama_lengkap } =
      await request.json();

    const accountData = await readGoogleSheet<AccountData>("account");

    if (accountData.some((acc) => acc.email === email)) {
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const allowedRoles = [
      "admin",
      "super_admin",
      "admin_rt",
      "admin_rw",
      "ketua_rt",
      "ketua_rw",
      "admin_lembaga",
      "warga",
      "developer",
    ];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role tidak valid" },
        { status: 400 }
      );
    }

    if (["admin_rt", "ketua_rt"].includes(role) && (!rt_akses || !rw_akses)) {
      return NextResponse.json(
        {
          success: false,
          message: "RT dan RW akses harus diisi untuk role ini",
        },
        { status: 400 }
      );
    }

    if (["admin_rw", "ketua_rw"].includes(role) && !rw_akses) {
      return NextResponse.json(
        { success: false, message: "RW akses harus diisi untuk role ini" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const maxId = Math.max(0, ...accountData.map((acc) => acc.id));

    const newAccount: AccountData = {
      id: maxId + 1,
      email,
      password_hash: hashedPassword,
      role,
      rt_akses: rt_akses || "",
      rw_akses: rw_akses || "",
      nama_lengkap,
      status_aktif: "Aktif",
      last_login: "",
      subscription_status: "active",
      subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      created_at: new Date().toISOString(),
      updated_at: "",
      verified_by: session.email,
    };

    await writeGoogleSheet("account", newAccount);

    return NextResponse.json({
      success: true,
      message: "Account berhasil dibuat",
      data: { ...newAccount, password_hash: "***HIDDEN***" },
    });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || session.role !== "developer") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id, password, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const dataToUpdate: Partial<AccountData> = { ...updateData };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      dataToUpdate.password_hash = hashedPassword;
    }

    dataToUpdate.updated_at = new Date().toISOString();

    // Update data di Google Sheets
    await updateGoogleSheet({
      sheetName: "account",
      id,
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Account berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || session.role !== "developer") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    await writeGoogleSheet("account", {
      action: "delete",
      id,
    });

    return NextResponse.json({
      success: true,
      message: "Account berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
