// src/app/api/auth/session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized", user: null }, { status: 401 });
    }

    // Mengembalikan data sesi jika pengguna sudah login
    return NextResponse.json({ success: true, user: session });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", user: null },
      { status: 500 }
    );
  }
}