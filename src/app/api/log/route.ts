import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";

interface LogData {
  id: number;
  user_email: string;
  user_role: string;
  action_type: string;
  table_affected: string;
  record_id: string;
  old_data: string;
  new_data: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const logData = (await readGoogleSheet("log_aktivitas")) as LogData[];

    // Sort by latest first
    const sortedLogs = logData.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(sortedLogs);
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

    const logData = (await readGoogleSheet("log_aktivitas")) as LogData[];
    const maxId = Math.max(...logData.map((l) => l.id), 0);

    const logEntry = {
      id: maxId + 1,
      user_email,
      user_role,
      action_type,
      table_affected,
      record_id,
      old_data: JSON.stringify(old_data || {}),
      new_data: JSON.stringify(new_data || {}),
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      timestamp: new Date().toISOString(),
    };

    await writeGoogleSheet("log_aktivitas", [logEntry]);

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
