import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    let whereClause: any = {};

    // If not admin/authorized, filter active and deadline
    if (!session || !["admin", "super_admin", "admin_rw"].includes(session.role)) {
      whereClause.status_aktif = "Aktif";
      // Prisma comparison for string dates might be tricky if stored as string.
      // If deadline is string YYYY-MM-DD, we can compare string-wise if format is consistent.
      // Ideally schema should be DateTime. Schema is String? according to recent update.
      // We might need to filter manually or change schema. For now, strict string compare or client filter.
      // Let's rely on retrieving all active and filtering in memory for deadline if strictly needed,
      // or just return all active.
      // Logic from original: deadlineDate >= today
    }

    const lokerData = await prisma.loker.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' }
    });

    if (!session || !["admin", "super_admin", "admin_rw"].includes(session.role)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeLoker = lokerData.filter((l: any) => {
        if (!l.deadline) return true; // No deadline = always active? or never? Assumption: always.
        const d = new Date(l.deadline);
        return d >= today;
      });
      return NextResponse.json(activeLoker);
    }

    return NextResponse.json(lokerData);
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

    const lokerToAdd = await prisma.loker.create({
      data: {
        posisi: newLoker.posisi,
        perusahaan: newLoker.perusahaan,
        deskripsi: newLoker.deskripsi,
        gambar_url: newLoker.gambar_url,
        requirements: newLoker.requirements,
        salary_range: newLoker.salary_range,
        lokasi: newLoker.lokasi,
        contact_method: newLoker.contact_method,
        contact_person: newLoker.contact_person,
        status_aktif: "Aktif",
        admin_poster: newLoker.admin_poster, // Or from session
        deadline: newLoker.deadline,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

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

    // Remove undefined/nulls if any? Prisma handles it. 
    // Just ensure id is int

    const result = await prisma.loker.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Lowongan berhasil diperbarui",
      data: result,
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
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "ID loker harus disertakan" },
        { status: 400 }
      );
    }

    await prisma.loker.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        status_aktif: "Non-Aktif",
        updated_at: new Date()
      }
    });

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
