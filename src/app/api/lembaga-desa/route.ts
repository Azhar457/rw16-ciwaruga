import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeLembaga = await prisma.lembagaDesa.findMany({
      where: { status_aktif: "Aktif" },
      orderBy: { nama_lembaga: 'asc' }
    });

    return NextResponse.json(activeLembaga);
  } catch (error) {
    console.error("Error fetching lembaga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (
      !session ||
      !["ketua_rw", "admin", "super_admin"].includes(session.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const newLembaga = await request.json();

    const lembagaToAdd = await prisma.lembagaDesa.create({
      data: {
        nama_lembaga: newLembaga.nama_lembaga,
        ketua: newLembaga.ketua,
        sekretaris: newLembaga.sekretaris,
        bendahara: newLembaga.bendahara,
        program_kerja: newLembaga.program_kerja,
        kontak: newLembaga.kontak,
        alamat_sekretariat: newLembaga.alamat_sekretariat,
        status_aktif: "Aktif",
        logo_url: newLembaga.logo_url,
        created_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Data lembaga berhasil ditambahkan",
      data: lembagaToAdd,
    });
  } catch (error) {
    console.error("Error adding lembaga:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}