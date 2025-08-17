import { NextResponse } from "next/server";
import { getUmkm, postUmkm } from "@/lib/googleSheets";

export async function GET() {
  try {
    const data = await getUmkm();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching UMKM data:", error);
    return NextResponse.json(
      { error: "Failed to fetch UMKM data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await postUmkm(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error posting UMKM data:", error);
    return NextResponse.json(
      { error: "Failed to post UMKM data" },
      { status: 500 }
    );
  }
}
