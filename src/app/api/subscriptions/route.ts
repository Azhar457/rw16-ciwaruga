import { NextRequest, NextResponse } from "next/server";
import {
  readGoogleSheet,
  writeGoogleSheet,
  updateGoogleSheet,
} from "@/lib/googleSheets";
import { getSession } from "@/lib/auth";

interface SubscriptionData {
  id: number;
  rw_code: string;
  nama_rw: string;
  contact_person: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "suspended";
  payment_proof: string;
  notes: string;
  created_at: string;
  updated_at: string;
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

    const subscriptionData = (await readGoogleSheet(
      "subscriptions"
    )) as unknown as SubscriptionData[];

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
    const subscriptionData = (await readGoogleSheet(
      "subscriptions"
    )) as unknown as SubscriptionData[];

    // Check if RW already exists
    const existingRW = subscriptionData.find(
      (sub) => sub.rw_code === newSubscription.rw_code
    );
    if (existingRW) {
      return NextResponse.json(
        { success: false, message: "RW sudah terdaftar" },
        { status: 400 }
      );
    }

    const maxId = Math.max(...subscriptionData.map((s) => s.id), 0);
    const subscriptionToAdd = {
      ...newSubscription,
      id: maxId + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await writeGoogleSheet("subscriptions", subscriptionToAdd);

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

    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    await updateGoogleSheet("subscriptions", id, dataToUpdate);

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
