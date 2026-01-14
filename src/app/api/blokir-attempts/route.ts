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

    const blokirData = await prisma.blokirAttempt.findMany({
      orderBy: { last_attempt: 'desc' }
    });

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

    const existingRecord = await prisma.blokirAttempt.findUnique({
      where: { ip_address: ip_address }
    });

    if (existingRecord) {
      // Update existing record
      const isBlockTrigger = existingRecord.failed_count + 1 >= 5;

      await prisma.blokirAttempt.update({
        where: { ip_address: ip_address },
        data: {
          failed_count: { increment: 1 },
          last_attempt: new Date(),
          status: isBlockTrigger ? "blocked" : existingRecord.status,
          blocked_until: isBlockTrigger ? new Date(Date.now() + 24 * 60 * 60 * 1000) : existingRecord.blocked_until,
          total_blocks: isBlockTrigger ? { increment: 1 } : existingRecord.total_blocks,
          nik_attempted: nik_attempted || existingRecord.nik_attempted,
          kk_attempted: kk_attempted || existingRecord.kk_attempted,
        }
      });
    } else {
      // Create new record
      await prisma.blokirAttempt.create({
        data: {
          ip_address,
          nik_attempted,
          kk_attempted,
          failed_count: 1,
          blocked_until: null,
          total_blocks: 0,
          first_attempt: new Date(),
          last_attempt: new Date(),
          status: "monitoring",
        }
      });
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
