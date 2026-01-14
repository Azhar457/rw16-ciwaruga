import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !["admin", "super_admin", "developer"].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const logData = await prisma.logAktivitas.findMany({
      orderBy: { timestamp: 'desc' }
    });

    return NextResponse.json(logData);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      user_email,
      user_role,
      action_type,
      table_affected,
      record_id,
      old_data,
      new_data,
    } = await request.json();

    // Ideally verify session if this is protected, but logs can be from system actions?
    // Maintaining current open-ish behavior for now or check session if needed.

    await prisma.logAktivitas.create({
      data: {
        user_email,
        user_role,
        action_type,
        table_affected,
        record_id,
        old_data: old_data ? JSON.stringify(old_data) : undefined,
        new_data: new_data ? JSON.stringify(new_data) : undefined,
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Log berhasil dicatat",
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
