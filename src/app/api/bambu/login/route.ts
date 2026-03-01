import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Step 1: Login
  const loginRes = await fetch(
    "https://api.bambulab.com/v1/user-service/user/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account: email, password }),
    }
  );

  if (!loginRes.ok) {
    return NextResponse.json(
      { error: "Login failed. Check your credentials." },
      { status: 401 }
    );
  }

  const loginData = await loginRes.json();
  const token = loginData.accessToken;

  // Step 2: Get UID
  const prefRes = await fetch(
    "https://api.bambulab.com/v1/design-user-service/my/preference",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  let uid = "";
  if (prefRes.ok) {
    const prefData = await prefRes.json();
    uid = String(prefData.uid);
  }

  return NextResponse.json({ token, uid });
}
