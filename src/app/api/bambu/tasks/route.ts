import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-bambu-token");
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");
  const limit = searchParams.get("limit") || "50";

  if (!deviceId) {
    return NextResponse.json(
      { error: "deviceId required" },
      { status: 400 }
    );
  }

  const url = `https://api.bambulab.com/v1/user-service/my/tasks?deviceId=${deviceId}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
