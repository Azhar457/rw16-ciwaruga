import { NextRequest, NextResponse } from "next/server";
import { readGoogleSheet, writeGoogleSheet } from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";


interface BlokirData {
  id: number;
  ip_address: string;
  nik_attempted: string;
  kk_attempted: string;
  failed_count: number;
  blocked_until: string;
  total_blocks: number;
  first_attempt: string;
  last_attempt: string;
  status: string;
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

    const blokirData = (await readGoogleSheet(
      "blokir_attempts"
    )) as unknown as BlokirData[];

    return NextResponse.json(blokirData);
  } catch (error) {
    console.error("Error fetching security data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ip_address, nik_attempted, kk_attempted } = await request.json();

    const blokirData = (await readGoogleSheet(
      "blokir_attempts"
    )) as unknown as BlokirData[];
    const existingRecord = blokirData.find((b) => b.ip_address === ip_address);

    if (existingRecord) {
      // Update existing record
      existingRecord.failed_count += 1;
      existingRecord.last_attempt = new Date().toISOString();

      if (existingRecord.failed_count >= 5) {
        existingRecord.status = "blocked";
        existingRecord.blocked_until = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString();
        existingRecord.total_blocks += 1;
      }
    } else {
      // Create new record
      const maxId = Math.max(...blokirData.map((b) => b.id || 0), 0); // Added || 0 for safety
      const newRecord = {
        id: maxId + 1,
        ip_address,
        nik_attempted,
        kk_attempted,
        failed_count: 1,
        blocked_until: "",
        total_blocks: 0,
        first_attempt: new Date().toISOString(),
        last_attempt: new Date().toISOString(),
        status: "monitoring",
      };

      await writeGoogleSheet("blokir_attempts", { action: 'append', data: newRecord });
    }

    return NextResponse.json({
      success: true,
      message: "Security log updated",
    });
  } catch (error) {
    console.error("Error updating security data:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
