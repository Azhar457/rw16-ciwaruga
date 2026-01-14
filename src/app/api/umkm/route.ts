import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const verifiedUmkm = await prisma.uMKM.findMany({
      where: {
        status_verifikasi: "Verified"
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ data: verifiedUmkm });
  } catch (error) {
    console.error("Error fetching UMKM:", error);
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
      !["ketua_rt", "ketua_rw", "admin", "super_admin"].includes(session.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const newUmkm = await request.json();

    // Determine linked_warga_id if provided or linkable
    // Assuming newUmkm matches schema fields roughly

    const umkmToAdd = await prisma.uMKM.create({
      data: {
        nama_usaha: newUmkm.nama_usaha,
        jenis_usaha: newUmkm.jenis_usaha,
        alamat: newUmkm.alamat,
        no_hp: newUmkm.no_hp,
        deskripsi: newUmkm.deskripsi,
        foto_url: newUmkm.foto_url,
        status_verifikasi: "pending", // Default pending
        admin_approver: session.nama_lengkap, // Or null initially? Existing logic sets it to creator?
        // "pemilik_nik_encrypted" handling?
        // "linked_warga_id"?
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "UMKM berhasil ditambahkan",
      data: umkmToAdd,
    });
  } catch (error) {
    console.error("Error adding UMKM:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
