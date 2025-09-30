import { NextRequest, NextResponse } from "next/server";
import {
  readGoogleSheet,
  updateGoogleSheet,
  writeGoogleSheet,
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
  [key: string]: string | number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

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

    // Update Google Sheet
    await updateGoogleSheet("account", id, dataToUpdate);

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
