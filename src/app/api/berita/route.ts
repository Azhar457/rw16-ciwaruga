import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const publishedBerita = await prisma.berita.findMany({
      where: {
        status_publish: "Published",
      },
      orderBy: {
        published_at: "desc",
      },
    });

    // Handle null published_at if necessary, but sort should handle it.
    // Ensure data types match expected response.
    return NextResponse.json(publishedBerita);
  } catch (error) {
    console.error("Error fetching berita:", error);
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
      !["admin_bph", "admin_rw", "ketua_rw", "admin"].includes(session.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }
    const newBerita = await request.json();
    const statusPublish = session.role === "ketua_rw" ? "Published" : "Pending";

    // Ensure fields exist
    const beritaToAdd = await prisma.berita.create({
      data: {
        judul: newBerita.judul,
        konten: newBerita.konten,
        kategori: newBerita.kategori,
        foto_url: newBerita.foto_url,
        penulis: session.nama_lengkap,
        status_publish: statusPublish,
        views: 0,
        admin_approver: session.role === "ketua_rw" ? session.nama_lengkap : "",
        published_at: statusPublish === "Published" ? new Date().toISOString() : null,
        created_at: new Date(),
        updated_at: new Date(),
        lembaga_id: newBerita.lembaga_id // Optional
      }
    });

    return NextResponse.json({
      success: true,
      message: "Berita berhasil ditambahkan",
      data: beritaToAdd,
    });
  } catch (error: any) {
    console.error("Error adding berita:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
