import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";

interface BeritaData {
  id: number;
  judul: string;
  konten: string;
  kategori: string;
  penulis: string;
  foto_url: string;
  status_publish: string;
  views: number;
  admin_approver: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    const beritaData = (await readGoogleSheet("berita")) as BeritaData[];

    // Filter hanya yang published untuk public
    const publishedBerita = beritaData
      .filter((berita) => berita.status_publish === "Published")
      .sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      );

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
      !["ketua_rt", "ketua_rw", "admin", "super_admin"].includes(session.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const newBerita = await request.json();
    const beritaData = (await readGoogleSheet("berita")) as BeritaData[];

    const maxId = Math.max(...beritaData.map((b) => b.id), 0);

    // Berita dari ketua_rw otomatis published (berita utama)
    const statusPublish = session.role === "ketua_rw" ? "published" : "pending";

    const beritaToAdd = {
      ...newBerita,
      id: maxId + 1,
      penulis: session.nama_lengkap,
      status_publish: statusPublish,
      views: 0,
      admin_approver: session.role === "ketua_rw" ? session.nama_lengkap : "",
      published_at:
        statusPublish === "published" ? new Date().toISOString() : "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await writeGoogleSheet("berita", [beritaToAdd]);

    return NextResponse.json({
      success: true,
      message: "Berita berhasil ditambahkan",
      data: beritaToAdd,
    });
  } catch (error) {
    console.error("Error adding berita:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
