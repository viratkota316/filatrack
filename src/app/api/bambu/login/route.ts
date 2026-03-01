import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Step 1: Login
    const loginRes = await fetch(
      "https://api.bambulab.com/v1/user-service/user/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "FilaTrack/1.0",
        },
        body: JSON.stringify({ account: email, password }),
      }
    );

    const loginText = await loginRes.text();
    let loginData;
    try {
      loginData = JSON.parse(loginText);
    } catch {
      return NextResponse.json(
        { error: `Bambu Lab returned invalid response (${loginRes.status})` },
        { status: 502 }
      );
    }

    if (!loginRes.ok) {
      const msg =
        loginData?.message ||
        loginData?.error ||
        `Login failed (status ${loginRes.status})`;
      return NextResponse.json({ error: msg }, { status: loginRes.status });
    }

    // The token can be in different fields depending on API version
    const token =
      loginData.accessToken ||
      loginData.token ||
      loginData.access_token;

    if (!token) {
      // Bambu Lab may require email verification or 2FA
      if (loginData.loginType === "verifyCode" || loginData.tfaKey) {
        return NextResponse.json(
          {
            error:
              "Your account requires email verification or 2FA. Please log into handy.bambulab.com first to verify, then try again.",
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Login succeeded but no token returned. Try again." },
        { status: 502 }
      );
    }

    // Step 2: Get UID
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
      // UID fetch is non-critical, continue without it
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
