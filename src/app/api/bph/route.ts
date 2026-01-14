import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeBPH = await prisma.bPH.findMany({
      where: { status_aktif: "Aktif" },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json(activeBPH);
  } catch (error) {
    console.error("Error fetching BPH:", error);
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

    const newBPH = await request.json();

    const bphToAdd = await prisma.bPH.create({
      data: {
        nama: newBPH.nama,
        jabatan: newBPH.jabatan,
        periode_start: newBPH.periode_start,
        periode_end: newBPH.periode_end, // Optional
        foto_url: newBPH.foto_url,
        kontak: newBPH.kontak,
        bio: newBPH.bio,
        status_aktif: "Aktif",
        created_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Data BPH berhasil ditambahkan",
      data: bphToAdd,
    });
  } catch (error) {
    console.error("Error adding BPH:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
