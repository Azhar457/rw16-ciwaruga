import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({ user }, { status: 200 });
}
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Set-Cookie":
          "session_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
      },
    }
  );
}
