import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    totalWarga: 0,
    totalUmkm: 0,
    totalLoker: 0,
    totalBerita: 0,
  });
}
