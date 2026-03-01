import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, code, tfaKey } = await req.json();

    // Send verification code to Bambu Lab
    const verifyRes = await fetch(
      "https://api.bambulab.com/v1/user-service/user/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "FilaTrack/1.0",
        },
        body: JSON.stringify({ account: email, code, tfaKey }),
      }
    );

    const verifyText = await verifyRes.text();
    let verifyData;
    try {
      verifyData = JSON.parse(verifyText);
    } catch {
      return NextResponse.json(
        { error: `Bambu Lab returned invalid response (${verifyRes.status})` },
        { status: 502 }
      );
    }

    if (!verifyRes.ok) {
      const msg =
        verifyData?.message ||
        verifyData?.error ||
        `Verification failed (status ${verifyRes.status})`;
      return NextResponse.json({ error: msg }, { status: verifyRes.status });
    }

    const token =
      verifyData.accessToken ||
      verifyData.token ||
      verifyData.access_token;

    if (!token) {
      return NextResponse.json(
        { error: "Verification succeeded but no token returned." },
        { status: 502 }
      );
    }

    // Get UID
    let uid = "";
    try {
      const prefRes = await fetch(
        "https://api.bambulab.com/v1/design-user-service/my/preference",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "FilaTrack/1.0",
          },
        }
      );
      if (prefRes.ok) {
        const prefData = await prefRes.json();
        uid = String(prefData.uid || prefData.id || "");
      }
    } catch {
      // UID fetch is non-critical
    }

    return NextResponse.json({ token, uid });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${msg}` },
      { status: 500 }
    );
  }
}
