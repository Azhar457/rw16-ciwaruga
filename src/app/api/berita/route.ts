import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.berita.findMany({
        where: {
          status_publish: "Published",
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.berita.count({
        where: {
          status_publish: "Published",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching berita:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data berita" },
      { status: 500 }
    );
  }
}
