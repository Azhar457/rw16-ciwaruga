import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "developer") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }
    const accountData = await prisma.user.findMany({
      orderBy: { id: 'asc' }
    });

    // Hide password hashes
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

    const accountToAdd = await prisma.user.create({
      data: {
        email: newAccount.email,
        nama_lengkap: newAccount.nama_lengkap,
        password_hash: hashedPassword,
        role: newAccount.role,
        rt_akses: newAccount.rt_akses,
        rw_akses: newAccount.rw_akses,
        status_aktif: "Aktif",
        subscription_status: newAccount.subscription_status,
        subscription_end: newAccount.subscription_end,
        created_at: new Date()
        // verified_by?
      }
    });

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

    // Remove invalid fields from dataToUpdate if User model is strict or just map explicitly
    // For safety, let's map known fields
    const validUpdateData: any = {};
    if (dataToUpdate.email) validUpdateData.email = dataToUpdate.email;
    if (dataToUpdate.nama_lengkap) validUpdateData.nama_lengkap = dataToUpdate.nama_lengkap;
    if (dataToUpdate.role) validUpdateData.role = dataToUpdate.role;
    if (dataToUpdate.rt_akses !== undefined) validUpdateData.rt_akses = dataToUpdate.rt_akses;
    if (dataToUpdate.rw_akses !== undefined) validUpdateData.rw_akses = dataToUpdate.rw_akses;
    if (dataToUpdate.status_aktif) validUpdateData.status_aktif = dataToUpdate.status_aktif;
    if (dataToUpdate.subscription_status) validUpdateData.subscription_status = dataToUpdate.subscription_status;
    if (dataToUpdate.subscription_end !== undefined) validUpdateData.subscription_end = dataToUpdate.subscription_end;
    if (dataToUpdate.password_hash) validUpdateData.password_hash = dataToUpdate.password_hash;

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: validUpdateData
    });

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
