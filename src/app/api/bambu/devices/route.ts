import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-bambu-token");
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch(
    "https://api.bambulab.com/v1/iot-service/api/user/bind",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: res.status }
    );
  }

  const data = await res.json();
  // API might return { devices: [...] } or just [...]
  const devices = data.devices || data;
  return NextResponse.json({ devices });
}
