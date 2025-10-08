import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
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
    const accountData = await readGoogleSheet("account");
    const safeAccountData = accountData.map((acc: any) => ({
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
    const { password, ...newAccount } = await request.json();
    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const accountToAdd = {
      ...newAccount,
      password_hash: hashedPassword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status_aktif: "Aktif",
    };
    const result = await writeGoogleSheet("account", {
      action: "append",
      data: accountToAdd,
    });
    if (!result.success) throw new Error(result.message);
    return NextResponse.json({
      success: true,
      message: "Akun berhasil ditambahkan",
    });
  } catch (error: any) {
    console.error("Error adding account:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
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
    const dataToUpdate: any = { ...updateData };
    if (password) {
      dataToUpdate.password_hash = await bcrypt.hash(password, 12);
    }
    dataToUpdate.updated_at = new Date().toISOString();
    const result = await writeGoogleSheet("account", {
      action: "update",
      id,
      data: dataToUpdate,
    });
    if (!result.success) throw new Error(result.message);
    return NextResponse.json({
      success: true,
      message: "Akun berhasil diupdate",
    });
  } catch (error: any) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
