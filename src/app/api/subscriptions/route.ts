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

    const subscriptionData = await prisma.subscription.findMany({
      orderBy: { rw_code: 'asc' }
    });

    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const newSubscription = await request.json();

    // Check if RW already exists
    const existingRW = await prisma.subscription.findUnique({
      where: { rw_code: newSubscription.rw_code }
    });

    if (existingRW) {
      return NextResponse.json(
        { success: false, message: "RW sudah terdaftar" },
        { status: 400 }
      );
    }

    const subscriptionToAdd = await prisma.subscription.create({
      data: {
        rw_code: newSubscription.rw_code,
        nama_rw: newSubscription.nama_rw,
        contact_person: newSubscription.contact_person,
        email: newSubscription.email,
        phone: newSubscription.phone,
        start_date: newSubscription.start_date,
        end_date: newSubscription.end_date,
        status: newSubscription.status || 'active',
        payment_proof: newSubscription.payment_proof,
        notes: newSubscription.notes,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subscription berhasil ditambahkan",
      data: subscriptionToAdd,
    });
  } catch (error) {
    console.error("Error adding subscription:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subscription berhasil diupdate",
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
